import React, { useState } from "react";
import WhoisOutput from "./WhoisOutput";
import { FaRocket, FaSyncAlt } from "react-icons/fa";
const REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;

const WhoisForm = () => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [whoisData, setWhoisData] = useState(
    "Enter a domain to get WHOIS info..."
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setWhoisData(`Fetching WHOIS for ${domain}...`);

    try {
      const response = await fetch(`${REACT_APP_SERVER}/whois`, {
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
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-center gap-x-5"
      >
        <input
          type="text"
          placeholder="Enter domain (e.g., example.com)"
          className="input-box foucs:outline-0"
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button type="submit" className="btn w-20! text-center">
          {loading ? <FaSyncAlt className="animate-spin" /> : <FaRocket />}
        </button>
      </form>
      <WhoisOutput whoisData={whoisData} />
    </div>
  );
};

export default WhoisForm;
