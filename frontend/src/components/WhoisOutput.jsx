import React from "react";

const WhoisOutput = ({ whoisData }) => {
  return (
    <div className="mt-4 terminal">
      <pre>{whoisData}</pre>
    </div>
  );
};

export default WhoisOutput;
