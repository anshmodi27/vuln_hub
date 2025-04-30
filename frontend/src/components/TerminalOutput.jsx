import React, { useEffect, useRef } from "react";

const TerminalOutput = ({ output }) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]); // Auto-scroll when output updates

  return (
    <div ref={terminalRef} className="mt-5 terminal">
      <p className="whitespace-pre-wrap overflow-x-hidden min-h-[20px] max-h-[600px] transition-all duration-300 ease-in-out font-semibold">
        {output}
      </p>
    </div>
  );
};

export default TerminalOutput;
