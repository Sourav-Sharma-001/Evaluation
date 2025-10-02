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
  const [stats, setStats] = useState({
    uptime: 0,
    avgResponseTime: 0,
    peakLatency: 0,
    peakLatencyTimestamp: null,
    requestVolume: 0,
    avgPerDay: 0,
    errorRate: 0,
    mostCommonError: "N/A",
    lastDowntime: null,
    dailyUptime: [],
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchStats = async (m, y) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stats?month=${m}&year=${y}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();

      setStats(data || stats);

      if (Array.isArray(data.dailyUptime)) {
        setChartData(
          data.dailyUptime.map((d) => ({
            date: new Date(d.date).toLocaleDateString("default", {
              day: "numeric",
              month: "short",
            }),
            uptime: d.uptime || 0,
          }))
        );
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(month, year);
  }, [month, year]);

  const handleMonthChange = (e) => setMonth(parseInt(e.target.value));
  const handleYearChange = (e) => setYear(parseInt(e.target.value));

  if (loading) return <p style={{ color: "white" }}>Loading stats...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="analysis-container">
      <h1>Analysis</h1>

      <div className="time-selector">
        <label>
          Month:
          <select value={month} onChange={handleMonthChange}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year:
          <input
            type="number"
            value={year}
            onChange={handleYearChange}
            min="2000"
            max={new Date().getFullYear()}
          />
        </label>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Uptime (Month)</h3>
          <div className="circle green">{stats.uptime?.toFixed(1) || 0}%</div>
          <p>
            Last downtime:{" "}
            {stats.lastDowntime
              ? new Date(stats.lastDowntime).toLocaleString()
              : "N/A"}
          </p>
        </div>

        <div className="card">
          <h3>Average Response Time</h3>
          <div className="circle blue">{stats.avgResponseTime || 0} ms</div>
          <p>
            Peak latency: {stats.peakLatency || 0} ms on{" "}
            {stats.peakLatencyTimestamp
              ? new Date(stats.peakLatencyTimestamp).toLocaleString()
              : "N/A"}
          </p>
        </div>

        <div className="card">
          <h3>Request Volume</h3>
          <div className="circle yellow">{stats.requestVolume || 0}</div>
          <p>Avg/day: {stats.avgPerDay || 0}</p>
        </div>

        <div className="card">
          <h3>Error Rate</h3>
          <div className="circle red">{stats.errorRate?.toFixed(1) || 0}%</div>
          <p>Most common error: {stats.mostCommonError || "N/A"}</p>
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
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
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
