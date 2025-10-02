import React, { useEffect, useState } from "react";
import "./Config.css";

export default function Config() {
  const [showModal, setShowModal] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [validationErrors, setValidationErrors] = useState([]);

  const fetchConfigs = () => {
    fetch("${process.env.REACT_APP_API_BASE_URL}/api/config")
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
    setValidationErrors([]);
    setShowModal(true);
  };

  const handleToggle = (field) => {
    setSelectedApi((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setSelectedApi((prev) => ({ ...prev, [field]: value }));
  };

  const validateConfig = () => {
    const errors = [];

    if (!selectedApi.startDate) errors.push("Start Date is required");
    if (selectedApi.requestLimit < 0)
      errors.push("Request Limit must be positive");

    const duplicateName = apiData.some(
      (api) => api.apiName === selectedApi.apiName && api._id !== selectedApi._id
    );
    if (duplicateName) errors.push("API Name must be unique");

    if (selectedApi.scheduleOn) {
      if (!selectedApi.startTime || !selectedApi.endTime)
        errors.push("Start and End Time are required when schedule is ON");
      if (selectedApi.endTime <= selectedApi.startTime)
        errors.push("End Time must be after Start Time");

      const overlapping = apiData.some((api) => {
        if (api._id === selectedApi._id || !api.scheduleOn) return false;
        if (api.startDate !== selectedApi.startDate) return false;
        return (
          (selectedApi.startTime >= api.startTime &&
            selectedApi.startTime < api.endTime) ||
          (selectedApi.endTime > api.startTime &&
            selectedApi.endTime <= api.endTime)
        );
      });
      if (overlapping)
        errors.push("Schedule overlaps with another API on the same date");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const saveConfig = () => {
    if (!selectedApi) return;
    if (!validateConfig()) return;

    fetch("${process.env.REACT_APP_API_BASE_URL}/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedApi),
    })
      .then((res) => res.json())
      .then(() => {
        setShowModal(false);
        fetchConfigs();
      })
      .catch((err) => console.error("Error saving config:", err));
  };

  const filteredData = apiData.filter((api) =>
    api.apiName.toLowerCase().includes(filterText.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key] || "";
    let valB = b[sortConfig.key] || "";
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  return (
    <div className="config-container">
      <h2 className="config-title">API List</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Filter by API Name..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="table-wrapper">
        <table className="api-table">
          <thead>
            <tr>
              <th onClick={() => requestSort("apiName")}>
                API Name {sortConfig.key === "apiName" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => requestSort("startDate")}>
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
        <div className="modal-overlay fade-in" onClick={() => setShowModal(false)}>
          <div className="modal slide-up" onClick={(e) => e.stopPropagation()}>
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
                onChange={(e) => handleChange("requestLimit", parseInt(e.target.value))}
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

            <div className="modal-option">
              <label>Start Date</label>
              <input
                type="date"
                className="date-picker"
                value={selectedApi.startDate ? new Date(selectedApi.startDate).toISOString().split("T")[0] : ""}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>

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

            {validationErrors.length > 0 && (
              <div className="validation-errors">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="error-text">{err}</div>
                ))}
              </div>
            )}

            <button
              className="save-btn"
              onClick={saveConfig}
              disabled={validationErrors.length > 0}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
