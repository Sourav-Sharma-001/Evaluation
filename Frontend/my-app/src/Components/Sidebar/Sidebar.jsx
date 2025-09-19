import React from "react";
import {
  FaHome,
  FaBox,
  FaFileInvoice,
  FaCog,
  FaChartBar,
  FaUserCircle,
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        API
      </div>
      <hr />
      <div className="sidebar-pages">
        <div className="sidebar-item">
          <FaHome className="sidebar-icon" /> Home
        </div>
        <div className="sidebar-item">
          <FaBox className="sidebar-icon" /> Product
        </div>
        <div className="sidebar-item">
          <FaFileInvoice className="sidebar-icon" /> Invoice
        </div>
        <div className="sidebar-item">
          <FaChartBar className="sidebar-icon" /> Statistics
        </div>
        <div className="sidebar-item">
          <FaCog className="sidebar-icon" /> Settings
        </div>
      </div>
      <hr />
      <div className="sidebar-profile">
        <FaUserCircle className="profile-icon" />
        <span className="profile-name">John Doe</span>
      </div>
    </div>
  );
}
