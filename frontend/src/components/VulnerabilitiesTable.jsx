import React from "react";

const VulnerabilitiesTable = ({ vulnerabilities }) => {
  if (vulnerabilities.length === 0) return null;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border-2 text-sm bg-white text-black border-[#808080] font-[Tahoma]">
        <thead className="border-b-2 border-[#808080] bg-[#dfdfdf]">
          <tr>
            <th className="px-3 py-2 border-r border-[#808080] text-left">#</th>
            <th className="px-3 py-2 border-r border-[#808080] text-left">
              Vulnerability
            </th>
            <th className="px-3 py-2 border-r border-[#808080] text-left">
              Risk
            </th>
            <th className="px-3 py-2 border-r border-[#808080] text-left">
              Description
            </th>
            <th className="px-3 py-2 text-left">AI Remediation</th>
          </tr>
        </thead>
        <tbody>
          {vulnerabilities.map((vuln, idx) => (
            <tr
              key={idx}
              className="even:bg-[#c0c0c0]/20 border-b border-[#808080] align-top"
            >
              <td className="px-3 py-2 border-r border-[#808080] text-center">
                {idx + 1}
              </td>
              <td className="px-3 py-2 border-r border-[#808080]">
                {vuln.vulnerability}
              </td>
              <td className="px-3 py-2 border-r border-[#808080]">
                {vuln.risk}
              </td>
              <td className="px-3 py-2 border-r border-[#808080] whitespace-pre-wrap">
                {vuln.description}
              </td>
              <td className="px-3 py-2 whitespace-pre-wrap">
                {vuln.remediation}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VulnerabilitiesTable;
