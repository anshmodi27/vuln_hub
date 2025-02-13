from flask import Flask, request, Response, jsonify
import requests
import time
import google.generativeai as genai
from flask_cors import CORS  

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# ZAP and Gemini API Config
ZAP_URL = "http://localhost:8080"
API_KEY = "i41c0bl6ue4ugt6mloo47su3af"
GEMINI_API_KEY = "AIzaSyDw7RJPROXNQ-4EGmsD-kUkCoYxbIqXGao"

genai.configure(api_key=GEMINI_API_KEY)

def add_protocol_if_missing(url):
    """Ensure URL has http/https prefix."""
    if not url.startswith(("http://", "https://")):
        return "http://" + url
    return url

def get_ai_remediation(vulnerability, risk, description):
    """Generate AI-based remediation suggestions."""
    prompt = f"""
    Vulnerability: {vulnerability}
    Risk Level: {risk}
    Description: {description}

    Provide a professional cybersecurity remediation guide for fixing this vulnerability.
    """
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text if response and hasattr(response, "text") else "No AI remediation available."
    except Exception as e:
        return f"AI Error: {str(e)}"

@app.route("/scan", methods=["POST"])
def scan():
    """Handle vulnerability scanning with OWASP ZAP."""
    data = request.get_json()
    target_url = data.get("url")
    if not target_url:
        return jsonify({"error": "No URL provided!"}), 400

    target_url = add_protocol_if_missing(target_url)

    def generate():
        try:
            yield f"⏳ Starting Scan for {target_url}...\n"

            # 🕷️ Start Spider
            spider_response = requests.get(f"{ZAP_URL}/JSON/spider/action/scan/?apikey={API_KEY}&url={target_url}")
            if spider_response.status_code != 200 or "scan" not in spider_response.json():
                yield "❌ Spidering failed.\n"
                return
            spider_id = spider_response.json().get("scan")

            # Monitor Spider Progress
            while True:
                status_response = requests.get(f"{ZAP_URL}/JSON/spider/view/status/?apikey={API_KEY}&scanId={spider_id}")
                status = status_response.json().get("status", "0")
                yield f"🕷️ Spider Progress: {status}%\n"
                if status == "100":
                    break
                time.sleep(5)

            yield "✅ Spider Completed. Waiting for URLs to be added to scan tree...\n"
            time.sleep(5)

            # ⚡ Start Active Scan **only once**
            scan_response = requests.get(f"{ZAP_URL}/JSON/ascan/action/scan/?apikey={API_KEY}&url={target_url}")
            if scan_response.status_code != 200 or "scan" not in scan_response.json():
                yield "❌ Active scan failed.\n"
                return
            active_scan_id = scan_response.json().get("scan")

            # Monitor Active Scan Progress
            while True:
                status_response = requests.get(f"{ZAP_URL}/JSON/ascan/view/status/?apikey={API_KEY}&scanId={active_scan_id}")
                status = status_response.json().get("status", "0")
                yield f"⚡ Scan Progress: {status}%\n"
                if status == "100":
                    break
                time.sleep(5)

            yield "✅ Scan Completed. Fetching vulnerabilities...\n"

            # Retrieve Alerts (Vulnerabilities)
            alerts_response = requests.get(f"{ZAP_URL}/JSON/alert/view/alerts/?apikey={API_KEY}&baseurl={target_url}")
            if alerts_response.status_code == 200:
                alerts = alerts_response.json().get("alerts", [])
                
                # Fix total vulnerabilities count issue
                total_vulnerabilities = len(alerts)
                yield f"\n🔍 Total Vulnerabilities Found: {total_vulnerabilities}\n\n"

                if not alerts:
                    yield "✅ No vulnerabilities found.\n"

                for index, alert in enumerate(alerts, start=1):
                    vuln_name = alert.get("name", "Unknown")
                    risk = alert.get("risk", "Unknown")
                    desc = alert.get("description", "No description available.")
                    remediation = get_ai_remediation(vuln_name, risk, desc)

                    # Assign risk level colors
                    risk_color = {
                        "High": "🔴 High",
                        "Medium": "🟠 Medium",
                        "Low": "🟢 Low",
                        "Informational": "🔵 Informational"
                    }.get(risk, "⚪ Unknown")

                    yield f"""{index}. Vulnerability: {vuln_name}
   Risk Level: {risk_color}
   Description: {desc}
   Remediation Steps: {remediation.strip()}\n\n"""

            yield "✅ Scan completed.\n"

        except Exception as e:
            yield f"❌ Error: {str(e)}\n"

    return Response(generate(), content_type="text/plain")

if __name__ == "__main__":
    app.run(debug=True)
