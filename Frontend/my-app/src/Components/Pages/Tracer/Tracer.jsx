import React, { useEffect, useState } from "react";
import "./Tracer.css";

export default function Tracer() {
  const [logs, setLogs] = useState({ today: [], yesterday: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async (day) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tracer/logs?day=${day}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      return data.logs || [];
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch ${day} logs`);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllLogs = async () => {
      setLoading(true);
      setError(null);
      const todayLogs = await fetchLogs("today");
      const yesterdayLogs = await fetchLogs("yesterday");
      setLogs({ today: todayLogs, yesterday: yesterdayLogs });
      setLoading(false);
    };
    fetchAllLogs();
  }, []);

  const renderLogs = (day, items) => (
    <div className="day-section" key={day}>
      <h3>📅 {day.charAt(0).toUpperCase() + day.slice(1)}</h3>
      {items.length === 0 ? (
        <p style={{ color: "#ff5555" }}>No logs available</p>
      ) : (
        items.map((log) => (
          <div key={log._id} className="log-card">
            <p className="log-id">
              [{log._id}] ➝ <span className="method">{log.method}</span>{" "}
              <span className="endpoint">{log.endpoint}</span>
            </p>
            <div className="log-steps">
              {log.steps && log.steps.length > 0 ? (
                log.steps.map((step, i) => <p key={i}>↪ {step}</p>)
              ) : (
                <p>↪ No steps recorded</p>
              )}
            </div>
            <p className="log-url">
              ⤷ <a href={log.url}>{log.url || "N/A"}</a>
            </p>
            <p className="log-time">({log.responseTimeMs ? `${log.responseTimeMs}ms` : "N/A"})</p>
          </div>
        ))
      )}
    </div>
  );

  if (loading) return <p>Loading logs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="tracer-container">
      <h2>API Trace Logs</h2>
      {renderLogs("today", logs.today)}
      {renderLogs("yesterday", logs.yesterday)}
    </div>
  );
}
