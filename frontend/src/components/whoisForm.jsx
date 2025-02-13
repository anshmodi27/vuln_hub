import React, { useState } from "react";
import WhoisOutput from "./WhoisOutput";

const WhoisForm = () => {
  const [domain, setDomain] = useState("");
  const [whoisData, setWhoisData] = useState(
    "Enter a domain to get WHOIS info..."
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setWhoisData(`Fetching WHOIS for ${domain}...`);

    try {
      const response = await fetch("http://127.0.0.1:5000/whois", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ domain }),
      });

      const data = await response.text();
      setWhoisData(data);
    } catch (error) {
      setWhoisData("Error fetching WHOIS data.");
    }
  };

  return (
    <div className="window">
      <h1 className="text-lg font-bold">🔎 WHOIS Lookup</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter domain (e.g., example.com)"
          className="input-box"
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button type="submit" className="btn">
          🔍 Lookup
        </button>
      </form>
      <WhoisOutput whoisData={whoisData} />
    </div>
  );
};

export default WhoisForm;
