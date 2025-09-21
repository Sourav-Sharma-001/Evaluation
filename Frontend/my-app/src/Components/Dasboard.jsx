import React from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar/Sidebar";
import Home from "./Pages/Home/Home"

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="pages-container">
        <Home />
      </div>
    </div>
  );
}
