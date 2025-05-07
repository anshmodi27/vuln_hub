from flask import Flask, request, Response, jsonify
import requests
import time
import google.generativeai as genai
from flask_cors import CORS
import whois

app = Flask(__name__)
CORS(app)

ZAP_URL = "http://localhost:8080"
API_KEY = "btdtij1f6ptv2i2a80mikbp9s6"
GEMINI_API_KEY = "AIzaSyDw7RJPROXNQ-4EGmsD-kUkCoYxbIqXGao"

# app.config["last_scan"] = []  # Storage for final vulnerabilities

# At the top of app.py
scan_results_store = []

genai.configure(api_key=GEMINI_API_KEY)

def add_protocol_if_missing(url):
    if not url.startswith(("http://", "https://")):
        return "http://" + url
    return url

def get_ai_remediation(vulnerability, risk, description):
    start_time = time.time()
    prompt = {
        "contents": [{
            "parts": [{
                "text": f"""
                Vulnerability: {vulnerability}
                Risk Level: {risk}
                Description: {description}

                Write clear remediation steps without numbering or asterisks.
                """
            }]
        }]
    }

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, json=prompt)
        end_time = time.time()  # End AI timer
        print(f"[AI] Gemini API response time: {end_time - start_time:.2f} seconds")

        if response.status_code == 200:
            output = response.json()
            parts = output.get('candidates', [{}])[0].get('content', {}).get('parts', [])
            if parts:
                return parts[0].get('text', 'No content generated.')
            else:
                return "No AI remediation available."
        else:
            return f"AI Error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"AI Error: {str(e)}"

@app.route("/scan", methods=["POST"])
def scan():
    data = request.get_json()
    target_url = data.get("url")
    if not target_url:
        return jsonify({"error": "No URL provided!"}), 400

    target_url = add_protocol_if_missing(target_url)
    scan_results = []
    scan_start = time.time()

    local_results = []

    def generate():
        try:
            yield f"\u23f3 Starting Scan for {target_url}...\n"

            # Spider Start
            spider_response = requests.get(f"{ZAP_URL}/JSON/spider/action/scan/?apikey={API_KEY}&url={target_url}")
            spider_id = spider_response.json().get("scan")

            while True:
                status_response = requests.get(f"{ZAP_URL}/JSON/spider/view/status/?apikey={API_KEY}&scanId={spider_id}")
                status = status_response.json().get("status", "0")
                yield f"🕷️ Spider Progress: {status}%\n"
                if status == "100":
                    break
                time.sleep(3)

            yield "✅ Spider Completed.\n"
            time.sleep(3)

            # Active Scan
            scan_response = requests.get(f"{ZAP_URL}/JSON/ascan/action/scan/?apikey={API_KEY}&url={target_url}")
            active_scan_id = scan_response.json().get("scan")

            while True:
                status_response = requests.get(f"{ZAP_URL}/JSON/ascan/view/status/?apikey={API_KEY}&scanId={active_scan_id}")
                status = status_response.json().get("status", "0")
                yield f"⚡ Scan Progress: {status}%\n"
                if status == "100":
                    break
                time.sleep(3)

            yield "✅ Scan Completed. Fetching vulnerabilities...\n"

            # Fetch Vulnerabilities
            alerts_response = requests.get(f"{ZAP_URL}/JSON/alert/view/alerts/?apikey={API_KEY}&baseurl={target_url}")
            if alerts_response.status_code == 200:
                alerts = alerts_response.json().get("alerts", [])
                
                total_vulnerabilities = len(alerts)
                yield f"\n🔍 Total Vulnerabilities Found: {total_vulnerabilities}\n\n"

                if not alerts:
                    yield "✅ No vulnerabilities found.\n"

                for alert in alerts:
                    vuln_name = alert.get("name", "Unknown")
                    risk = alert.get("risk", "Unknown")
                    desc = alert.get("description", "No description available.")
                    remediation = get_ai_remediation(vuln_name, risk, desc)

                    local_results.append({
                        "vulnerability": vuln_name,
                        "risk": risk,
                        "description": desc,
                        "remediation": remediation
                    })

           

            # def generate_and_store():
            #     for chunk in generate():
            #      yield chunk
            #     app.config["last_scan"] = scan_results

            global scan_results_store
            scan_results_store = local_results
            yield "✅ All data fetched.\n"

            scan_end = time.time()
            print(f"[SCAN] Total Scan Time for {target_url}: {scan_end - scan_start:.2f}s")

        except Exception as e:
            yield f"❌ Error: {str(e)}\n"

    # Save after scan
    return Response(generate(), content_type="text/plain")

@app.route("/results", methods=["GET"])
def results():
    return jsonify(scan_results_store)

@app.route("/whois", methods=["POST"])
def whois_lookup():
    domain = request.form.get("domain")
    if not domain:
        return jsonify({"error": "No domain provided!"}), 400
    try:
        whois_start = time.time()
        w = whois.whois(domain)
        whois_end = time.time()
        print(f"[WHOIS] Lookup time for {domain}: {whois_end - whois_start:.2f}s")
        result = ""
        for key, value in w.items():
            result += f"{key}: {value}\n"
        return result
    except Exception as e:
        return f"❌ WHOIS Lookup Error: {str(e)}", 500

if __name__ == "__main__":
    app.run(debug=True)