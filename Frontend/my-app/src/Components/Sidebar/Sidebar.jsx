import React from "react";
import { FaHome, FaStream, FaChartBar, FaCog } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">API Management</h2>
      <nav>
        <ul>
          <li className="active"><FaHome /> Home</li>
          <li><FaStream /> Tracer</li>
          <li><FaChartBar /> Analysis</li>
          <li><FaCog /> Configuration</li>
        </ul>
      </nav>
    </aside>
  );
}
