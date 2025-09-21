import React from "react";
import { Routes, Route } from "react-router-dom";
import "./Dashboard.css";
import Sidebar from "./Sidebar/Sidebar";
import Home from "./Pages/Home/Home";
import Tracer from "./Pages/Tracer/Tracer";
import Analysis from "./Pages/Analysis/Analysis";
import Config from "./Pages/Config/Config";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="pages-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tracer" element={<Tracer />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/config" element={<Config />} />
        </Routes>
      </div>
    </div>
  );
}
