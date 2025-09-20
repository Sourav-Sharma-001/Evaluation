import React, { useState } from "react";
import "./Config.css";

export default function Config() {
  const [showModal, setShowModal] = useState(false);

  const apiData = [
    { name: "/api/Social", startDate: "2024-01-01" },
    { name: "/api/Link", startDate: "2024-02-15" },
    { name: "/api/Data", startDate: "2024-03-01" },
    { name: "/api/Weather", startDate: "2024-01-20" },
    { name: "/api/inventory", startDate: "2024-04-01" },
  ];

  return (
    <div className="config-container">
      <h2 className="config-title">API List</h2>
      <div className="table-wrapper">
        <table className="api-table">
          <thead>
            <tr>
              <th>API Name</th>
              <th>Start Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {apiData.map((api, index) => (
              <tr key={index}>
                <td>{api.name}</td>
                <td>{api.startDate}</td>
                <td
                  className="more-options"
                  onClick={() => setShowModal(true)}
                >
                  ⋮
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">Controls</h3>

            <div className="modal-option">
              <label>API</label>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>

            <div className="modal-option">
              <label>Tracer</label>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>

            <div className="modal-option">
              <label>Limit</label>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>

            <div className="limit-controls">
              <label className="label">Number of Request</label>
              <select className="small">
                <option>0</option>
                <option>10</option>
                <option>20</option>
              </select>
              <label className="label">Rate</label>
              <select className="rate">
                <option>sec</option>
                <option>min</option>
                <option>hour</option>
              </select>
            </div>

            <div className="modal-option">
              <label>Schedule On/Off</label>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>

            <div className="time-inputs">
              <label>Start Time:</label>
              <input type="time" />
              <label>End Time:</label>
              <input type="time" />
            </div>

            <button className="save-btn">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
