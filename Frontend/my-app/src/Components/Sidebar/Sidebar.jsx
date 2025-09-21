import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaStream, FaChartBar, FaCog } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <h2 className="logo">API Management</h2>
      <nav>
        <ul>
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/"><FaHome /> Home</Link>
          </li>
          <li className={location.pathname === "/tracer" ? "active" : ""}>
            <Link to="/tracer"><FaStream /> Tracer</Link>
          </li>
          <li className={location.pathname === "/analysis" ? "active" : ""}>
            <Link to="/analysis"><FaChartBar /> Analysis</Link>
          </li>
          <li className={location.pathname === "/config" ? "active" : ""}>
            <Link to="/config"><FaCog /> Configuration</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
