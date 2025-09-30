import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Analysis.css";

export default function Analysis() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/api/stats");
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();

        setStats(data);

        if (Array.isArray(data.dailyUptime)) {
          setChartData(
            data.dailyUptime.map((d) => ({
              date: new Date(d.date).toLocaleDateString("default", {
                day: "numeric",
                month: "short",
              }),
              uptime: d.uptime,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading stats...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!stats) return <p>No stats available</p>;

  return (
    <div className="analysis-container">
      <h1>Analysis</h1>

      <div className="cards">
        <div className="card">
          <h3>Uptime (Last 7 Days)</h3>
          <div className="circle green">
            {stats.uptime?.toFixed(1) ?? "N/A"}%
          </div>
          <p>
            Last downtime:{" "}
            {stats.lastDowntime
              ? new Date(stats.lastDowntime).toLocaleString()
              : "N/A"}
          </p>
        </div>

        <div className="card">
          <h3>Average Response Time</h3>
          <div className="circle blue">{stats.avgResponseTime ?? "N/A"} ms</div>
          <p>
            Peak latency: {stats.peakLatency ?? "N/A"} ms on{" "}
            {stats.peakLatencyTimestamp
              ? new Date(stats.peakLatencyTimestamp).toLocaleString()
              : "N/A"}
          </p>
        </div>

        <div className="card">
          <h3>Request Volume</h3>
          <div className="circle yellow">{stats.requestVolume ?? "N/A"}</div>
          <p>Avg/day: {stats.avgPerDay ?? "N/A"}</p>
        </div>

        <div className="card">
          <h3>Error Rate</h3>
          <div className="circle red">
            {stats.errorRate?.toFixed(1) ?? "0"}%
          </div>
          <p>Most common error: {stats.mostCommonError ?? "N/A"}</p>
        </div>
      </div>

      <div className="sales-overview">
        <h3>Uptime Overview</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line
                type="monotone"
                dataKey="uptime"
                stroke="#00b300"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No uptime data available</p>
        )}
      </div>
    </div>
  );
}
