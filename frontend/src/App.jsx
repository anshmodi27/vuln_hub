import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ScannerForm from "./components/ScannerForm";
import WhoisForm from "./components/whoisForm";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Sidebar />
      <div className="ml-64 mt-10 p-8">
        <Routes>
          <Route path="/" element={<ScannerForm />} />
          <Route path="/whois" element={<WhoisForm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
