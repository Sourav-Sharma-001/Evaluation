import React from "react";
import "./Config.css";

export default function Config() {
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
                <td className="more-options">⋮</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
