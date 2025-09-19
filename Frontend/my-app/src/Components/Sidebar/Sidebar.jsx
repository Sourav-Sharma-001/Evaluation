import React from "react";
import {
  FaHome,
  FaFileInvoice,
  FaCog,
  FaChartBar,  
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-heading">
        API Management
      </div>
      <hr />
      <div className="sidebar-pages">
        <div className="sidebar-item">
          <FaHome className="sidebar-icon" /> Home
        </div>
        <div className="sidebar-item">
          <FaFileInvoice className="sidebar-icon" /> Tracer
        </div>
        <div className="sidebar-item">
          <FaChartBar className="sidebar-icon" /> Analysis
        </div>
        <div className="sidebar-item">
          <FaCog className="sidebar-icon" /> Configuration
        </div>
      </div>      
    </div>
  );
}
