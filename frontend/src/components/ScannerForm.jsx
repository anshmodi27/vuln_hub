import React, { useState } from "react";
import TerminalOutput from "./TerminalOutput";
import { FaRocket, FaSyncAlt } from "react-icons/fa";
import VulnerabilitiesTable from "./VulnerabilitiesTable";

const REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;

const ScannerForm = () => {
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState("⏳ Waiting for scan to start...\n");
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(false);

  const startScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setOutput("⏳ Starting Scan...\n");
    setVulnerabilities([]);

    try {
      const response = await fetch(`${REACT_APP_SERVER}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      const read = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            await fetchResults();
            setLoading(false);
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setOutput((prev) => prev + chunk);
        }
      };

      read();
    } catch (err) {
      setOutput((prev) => prev + `\n❌ Error: ${err.message}\n`);
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${REACT_APP_SERVER}/results`);
      const data = await res.json();
      setVulnerabilities(data);
    } catch (err) {
      console.error("❌ Error fetching results:", err);
    }
  };

  return (
    <div className="window">
      <h1 className="text-lg font-bold mb-2">🔎 Vulnerability Scanner</h1>
      <form
        onSubmit={startScan}
        className="flex items-center justify-center gap-x-5"
      >
        <input
          type="text"
          placeholder="Enter URL"
          className="input-box"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="btn w-20! text-center"
          disabled={loading}
        >
          {loading ? (
            <FaSyncAlt className="animate-spin mx-auto" />
          ) : (
            <FaRocket className="mx-auto" />
          )}
        </button>
      </form>

      <TerminalOutput output={output} />
      <VulnerabilitiesTable vulnerabilities={vulnerabilities} />
    </div>
  );
};

export default ScannerForm;
