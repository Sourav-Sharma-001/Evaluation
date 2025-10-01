import React from "react";
import "./Tracer.css";

export default function Tracer() {
  const logs = {
    today: [
      {
        id: "a1b2c3d4-1234-5678-9abc-def000001",
        method: "GET",
        endpoint: "/api",
        steps: [
          "Entered userController",
          "Going DB to fetch user with id: 101",
          "Sending response with user",
        ],
        url: "/api/user/101",
        time: "478ms",
      },
      {
        id: "a1b2c3d4-1234-5678-9abc-def000001",
        method: "GET",
        endpoint: "/api",
        steps: [
          "Entered userController",
          "Going DB to fetch user with id: 101",
          "Sending response with user",
        ],
        url: "/api/user/101",
        time: "478ms",
      },
    ],
    yesterday: [
      {
        id: "a1b2c3d4-1234-5678-9abc-def000001",
        method: "GET",
        endpoint: "/api",
        steps: [
          "Entered userController",
          "Going DB to fetch user with id: 101",
          "Sending response with user",
        ],
        url: "/api/user/101",
        time: "478ms",
      },
      {
        id: "a1b2c3d4-1234-5678-9abc-def000001",
        method: "GET",
        endpoint: "/api",
        steps: [
          "Entered userController",
          "Going DB to fetch user with id: 101",
          "Sending response with user",
        ],
        url: "/api/user/101",
        time: "478ms",
      },
    ],
  };

  const renderLogs = (day, items) => (
    <div className="day-section">
      <h3>📅 {day}</h3>
      {items.map((log, index) => (
        <div key={index} className="log-card">
          <p className="log-id">
            [{log.id}] ➝ <span className="method">{log.method}</span>{" "}
            <span className="endpoint">{log.endpoint}</span>
          </p>
          <div className="log-steps">
            {log.steps.map((step, i) => (
              <p key={i}>↪ {step}</p>
            ))}
          </div>
          <p className="log-url">
            ⤷ <a href={log.url}>{log.url}</a>
          </p>
          <p className="log-time">({log.time})</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="tracer-container">
      <h2>API Trace Logs</h2>
      {renderLogs("Today", logs.today)}
      {renderLogs("Yesterday", logs.yesterday)}
    </div>
  );
}
