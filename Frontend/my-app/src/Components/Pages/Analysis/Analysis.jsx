import React from "react";
import "./Analysis.css";

export default function Analysis() {
  return (
    <div className="analysis-container">
      <h1>Analysis</h1>

      <div className="cards">
        <div className="card">
          <h3>Uptime (Last 7 Days)</h3>
          <div className="circle green">99.2%</div>
          <p>Last downtime: Apr 21, 11:45 PM</p>
        </div>

        <div className="card">
          <h3>Average Response Time</h3>
          <div className="circle blue">312 ms</div>
          <p>Peak latency: 940 ms on Apr 20</p>
        </div>

        <div className="card">
          <h3>Request Volume</h3>
          <div className="circle yellow">142k</div>
          <p>Avg/day: 20.2k</p>
        </div>

        <div className="card">
          <h3>Error Rate</h3>
          <div className="circle red">2.3%</div>
          <p>Most common error: 404</p>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="sales-overview">
        <h3>Sales overview <span>(+5) more in 2021</span></h3>
        <div className="graph-placeholder">
          <p>[Graph Placeholder]</p>
        </div>
      </div>
    </div>
  );
}
