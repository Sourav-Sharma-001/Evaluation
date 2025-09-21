import React, { useEffect, useState } from "react";
import "./Home.css";

export default function Home() {
  const [apis, setApis] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/status")
      .then((res) => res.json())
      .then((data) => setApis(data))
      .catch((err) => console.error(err));
  }, []);

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

          {apis.length === 0 ? (
            <p>Loading APIs...</p>
          ) : (
            apis.map((api, index) => (
              <div key={api._id} className="status-row">
                <span className="api-name">{index + 1} {api.name}</span>
                <div className="status-blocks">
                  {api.blocks && api.blocks.map((color, i) => (
                    <span key={i} className={`status-block ${color}`}></span>
                  ))}
                  {api.status === "online" ? (
                    <span className="status-check">✔</span>
                  ) : (
                    <span className="status-cross">✖</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
