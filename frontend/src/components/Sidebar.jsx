import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="fixed top-10 left-0 h-screen w-60 sidebar">
      <nav className="flex flex-col space-y-2">
        <Link to="/" className="btn">
          🛡 Scanner
        </Link>
        <Link to="/whois" className="btn">
          🔍 WHOIS Lookup
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
