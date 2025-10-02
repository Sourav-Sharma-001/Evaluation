import React, { useEffect, useState } from "react";
import "./Tracer.css";

export default function Tracer() {
  const [logs, setLogs] = useState({ today: [], yesterday: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("${process.env.REACT_APP_API_BASE_URL}/api/tracer/logs");
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setLogs(data || { today: [], yesterday: [] });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const renderLogs = (day, items) => (
    <div className="day-section">
      <h3>📅 {day}</h3>
      {items.length === 0 ? (
        <p style={{ color: "#aaa" }}>No logs available</p>
      ) : (
        items.map((log, index) => (
          <div key={index} className="log-card">
            <p className="log-id">
              [{log.id}] ➝ <span className="method">{log.method}</span>{" "}
              <span className="endpoint">{log.endpoint}</span>
            </p>
            <div className="log-steps">
              {log.steps.map((step, i) => (
                <p key={i}>
                  ↪ {step.message}{" "}
                  <span style={{ color: "#666", fontSize: "0.75rem" }}>
                    ({new Date(step.timestamp).toLocaleTimeString()})
                  </span>
                </p>
              ))}
            </div>
            <p className="log-url">
              ⤷ <a href={log.url}>{log.url}</a>
            </p>
            <p className="log-time">({log.time})</p>
          </div>
        ))
      )}
    </div>
  );

  if (loading) return <p style={{ color: "white" }}>Loading logs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="tracer-container">
      <h2>API Trace Logs</h2>
      {renderLogs("Today", logs.today)}
      {renderLogs("Yesterday", logs.yesterday)}
    </div>
  );
}
