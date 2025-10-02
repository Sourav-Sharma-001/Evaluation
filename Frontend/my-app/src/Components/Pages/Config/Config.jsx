import React, { useEffect, useState } from "react";
import "./Config.css";

export default function Config() {
  const [showModal, setShowModal] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);

  const fetchConfigs = () => {
    fetch("http://localhost:5000/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) setApiData(data.data);
      })
      .catch((err) => console.error("Error fetching config:", err));
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const openModal = (api) => {
    setSelectedApi({ ...api });
    setShowModal(true);
  };

  const handleToggle = (field) => {
    setSelectedApi((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setSelectedApi((prev) => ({ ...prev, [field]: value }));
  };

  const saveConfig = () => {
    if (!selectedApi) return;

    fetch("http://localhost:5000/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedApi),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Config saved:", data);
        setShowModal(false);
        fetchConfigs();
      })
      .catch((err) => console.error("Error saving config:", err));
  };

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
                <td>
                  {api.startDate
                    ? new Date(api.startDate).toISOString().split("T")[0]
                    : "-"}
                </td>
                <td className="more-options" onClick={() => openModal(api)}>
                  ⋮
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedApi && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Controls</h3>

            <div className="modal-option">
              <label>API</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedApi.apiOn || false}
                  onChange={() => handleToggle("apiOn")}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="modal-option">
              <label>Tracer</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedApi.tracerOn || false}
                  onChange={() => handleToggle("tracerOn")}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="modal-option">
              <label>Limit</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedApi.requestLimit > 0}
                  onChange={() =>
                    handleChange(
                      "requestLimit",
                      selectedApi.requestLimit > 0 ? 0 : 10
                    )
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="limit-controls">
              <label className="label">Number of Request</label>
              <select
                className="small"
                value={selectedApi.requestLimit || 0}
                onChange={(e) =>
                  handleChange("requestLimit", parseInt(e.target.value))
                }
              >
                <option>0</option>
                <option>10</option>
                <option>20</option>
              </select>

              <label className="label">Rate</label>
              <select
                className="rate"
                value={selectedApi.rateUnit || "sec"}
                onChange={(e) => handleChange("rateUnit", e.target.value)}
              >
                <option>sec</option>
                <option>min</option>
                <option>hour</option>
              </select>
            </div>

            <div className="modal-option">
              <label>Schedule On/Off</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={selectedApi.scheduleOn || false}
                  onChange={() => handleToggle("scheduleOn")}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Calendar Picker */}
            <div className="modal-option">
              <label>Start Date</label>
              <input
                type="date"
                className="date-picker"
                value={
                  selectedApi.startDate
                    ? new Date(selectedApi.startDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>

            {/* Regular Time Inputs */}
            {selectedApi.scheduleOn && (
              <div className="time-inputs">
                <div>
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={selectedApi.startTime || ""}
                    onChange={(e) => handleChange("startTime", e.target.value)}
                  />
                </div>
                <div>
                  <label>End Time</label>
                  <input
                    type="time"
                    value={selectedApi.endTime || ""}
                    onChange={(e) => handleChange("endTime", e.target.value)}
                  />
                </div>
              </div>
            )}

            <button className="save-btn" onClick={saveConfig}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
