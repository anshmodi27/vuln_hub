import React, { useState } from "react";
import TerminalOutput from "./TerminalOutput";
import { FaRocket, FaSyncAlt } from "react-icons/fa";
const REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;

const ScannerForm = () => {
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState("⏳ Waiting for scan to start...\n");
  const [loading, setLoading] = useState(false);

  const startScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setOutput("⚠️ Enter URL for scan.\n");
      return;
    }

    setLoading(true);
    setOutput("⏳ Starting Scan...\n");

    try {
      const response = await fetch(`${REACT_APP_SERVER}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              setOutput((prev) => prev + "\n✅ Scan completed.\n");
              setLoading(false);
              break;
            }

            const chunk = decoder.decode(value, { stream: true });

            setOutput((prev) => {
              const prevLines = prev.split("\n");

              // Prevent duplicate progress updates
              if (prevLines.includes(chunk.trim())) {
                return prev;
              }

              // Detect 100% completion and break the loop
              if (
                chunk.includes("⚡ Scan Progress: 100%") ||
                chunk.includes("✅ Scan Completed")
              ) {
                return prev + chunk + "\n✅ Scan completed.\n";
              }

              return prev + chunk;
            });
          }
        } catch (error) {
          setOutput((prev) => prev + "\n❌ Error reading scan output.\n");
          setLoading(false);
        }
      };

      readStream();
    } catch (error) {
      setOutput((prev) => prev + "\n❌ Error during scanning.\n");
      setLoading(false);
    }
  };

  return (
    <div className="window">
      <h1 className="text-lg font-bold">🔎 Vulnerability Scanner</h1>
      <form
        onSubmit={startScan}
        className="flex items-center justify-center gap-x-5"
      >
        <input
          type="text"
          placeholder="Enter URL to scan"
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
          {loading ? <FaSyncAlt className="animate-spin" /> : <FaRocket />}
        </button>
      </form>
      <TerminalOutput output={output} />
    </div>
  );
};

export default ScannerForm;
