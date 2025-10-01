import React, { useEffect, useState } from "react";
import "./Config.css";

export default function Config() {
  const [showModal, setShowModal] = useState(false);
  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/config") // ✅ fixed full backend URL
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) setApiData(data.data);
      })
      .catch((err) => console.error("Error fetching config:", err));
  }, []);

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
                <td>{api.apiName}</td>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
