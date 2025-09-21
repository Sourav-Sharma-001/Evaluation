import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-heading">
        <h2>Home</h2>
      </div>
      <div className="api-container">
        <div className="api-display-container">
          <div className="status-header">
            <span>System status</span>
            <div className="month-nav">
              <span>&lt;</span>
              <span>Jan 2025</span>
              <span>&gt;</span>
            </div>
          </div>

          <div className="status-row">
            <span className="api-name">1 Api-Social</span>
            <div className="status-blocks">
              {Array(20).fill("green").map((c, i) => (
                <span key={i} className="status-block green"></span>
              ))}
            </div>
            <span className="status-check">✔</span>
          </div>

          <div className="status-row">
            <span className="api-name">2 Api-link</span>
            <div className="status-blocks">
              {[
                "green", "green", "green", "orange", "green", "green",
                "orange", "green", "yellow"
              ].map((c, i) => (
                <span key={i} className={`status-block ${c}`}></span>
              ))}
            </div>
            <span className="status-cross">✖</span>
          </div>

          <div className="status-row">
            <span className="api-name">3 Api-Data</span>
            <div className="status-blocks">
              {Array(18).fill("green").map((c, i) => (
                <span key={i} className="status-block green"></span>
              ))}
            </div>
            <span className="status-check">✔</span>
          </div>

          <div className="status-row">
            <span className="api-name">4 Api-Weather</span>
            <div className="status-blocks">
              {Array(18).fill("green").map((c, i) => (
                <span key={i} className="status-block green"></span>
              ))}
            </div>
            <span className="status-check">✔</span>
          </div>

          <div className="status-row">
            <span className="api-name">5 Api-Inventory</span>
            <div className="status-blocks">
              {Array(18).fill("green").map((c, i) => (
                <span key={i} className="status-block green"></span>
              ))}
            </div>
            <span className="status-check">✔</span>
          </div>
        </div>
      </div>
    </div>
  );
}
