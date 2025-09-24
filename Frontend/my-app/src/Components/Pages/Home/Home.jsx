import React, { useEffect, useState } from "react";
import "./Home.css";

export default function Home() {
  const [apis, setApis] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/status");
        const data = await res.json();
        setApis(data);
      } catch (err) {
        console.error("Error fetching API statuses:", err);
      }
    };

    fetchStatuses();
    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, []);

  const getBlockColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return "green";
    if (statusCode >= 300 && statusCode < 400) return "orange";
    if (statusCode >= 400 && statusCode < 600) return "red";
    if (statusCode >= 100 && statusCode < 200) return "yellow";
    return "gray";
  };

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
            apis.map((api, index) => {
              const statuses = api.statuses || [];
              const last = statuses[statuses.length - 1];
              const lastOk = last >= 200 && last < 300;
              return (
                <div className="status-row" key={api._id || index}>
                  <span className="api-name">
                    {index + 1}. {api.name}
                  </span>
                  <div className="status-blocks">
                    {statuses.map((code, i) => (
                      <span
                        key={i}
                        className={`status-block ${getBlockColor(code)}`}
                      ></span>
                    ))}
                    {lastOk ? (
                      <span className="status-check">✔</span>
                    ) : (
                      <span className="status-cross">✖</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
