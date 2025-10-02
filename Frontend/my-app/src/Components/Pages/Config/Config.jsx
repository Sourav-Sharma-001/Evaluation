import React, { useEffect, useState } from "react";
import "./Config.css";

export default function Config() {
  const [showModal, setShowModal] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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

    // --- Validation ---
    if (!selectedApi.startDate) {
      alert("Start Date is required");
      return;
    }

    if (selectedApi.scheduleOn) {
      if (!selectedApi.startTime || !selectedApi.endTime) {
        alert("Both Start Time and End Time are required when Schedule is ON");
        return;
      }

      if (selectedApi.endTime <= selectedApi.startTime) {
        alert("End Time must be after Start Time");
        return;
      }
    }

    if (selectedApi.requestLimit < 0) {
      alert("Request Limit cannot be negative");
      return;
    }

    // --- Save Config ---
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

  // --- Filtering ---
  const filteredData = apiData.filter((api) =>
    api.apiName.toLowerCase().includes(filterText.toLowerCase())
  );

  // --- Sorting ---
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    if (sortConfig.key === "startDate") {
      valA = valA || "";
      valB = valB || "";
    }
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="config-container">
      <h2 className="config-title">API List</h2>

      {/* Filter Input */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Filter by API Name..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "0.25rem",
            border: "1px solid #444",
            background: "#111a3c",
            color: "#fff",
            width: "250px",
          }}
        />
      </div>

      <div className="table-wrapper">
        <table className="api-table">
          <thead>
            <tr>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => requestSort("apiName")}
              >
                API Name {sortConfig.key === "apiName" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                style={{ cursor: "pointer" }}
                onClick={() => requestSort("startDate")}
              >
                Start Date {sortConfig.key === "startDate" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((api, index) => (
              <tr key={index}>
                <td>{api.apiName}</td>
                <td>{api.startDate ? new Date(api.startDate).toISOString().split("T")[0] : "-"}</td>
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
