import React, { useEffect, useState, useRef } from "react";
import "./Home.css";

export default function Home() {
  const [allApis, setAllApis] = useState([]); // full dataset for current month
  const [visibleApis, setVisibleApis] = useState([]); // for infinite scroll
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Month state (first day of month)
  const [currentMonth, setCurrentMonth] = useState(new Date("2025-01-01"));

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(20);
  const containerRef = useRef(null);

  // Fetch API statuses for the current month
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        setError(null);

        const month = currentMonth.getMonth() + 1; // 1-12
        const year = currentMonth.getFullYear();

        const res = await fetch(
          `http://localhost:5000/api/status?month=${month}&year=${year}`
        );

        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const result = await res.json();

        if (Array.isArray(result.data)) {
          setAllApis(result.data);
          setVisibleApis(result.data.slice(0, 20));
          setVisibleCount(20);
        } else {
          setAllApis([]);
          setVisibleApis([]);
          setError("API returned unexpected format");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setAllApis([]);
        setVisibleApis([]);
        setError("Failed to fetch API data");
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, [currentMonth]);

  // Infinite scroll observer
  useEffect(() => {
    if (!allApis.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => {
            const nextCount = prev + 20;
            setVisibleApis(allApis.slice(0, nextCount));
            return nextCount;
          });
        }
      },
      { root: containerRef.current, threshold: 1.0 }
    );

    const lastApi = containerRef.current?.lastElementChild;
    if (lastApi) observer.observe(lastApi);

    return () => {
      if (lastApi) observer.unobserve(lastApi);
    };
  }, [allApis, visibleApis]);

  // Status color
  const getBlockColor = (statusCode) => {
    if (statusCode === null) return "gray"; // <-- new: missing day
    if (statusCode >= 200 && statusCode < 300) return "green";
    if (statusCode >= 300 && statusCode < 400) return "orange";
    if (statusCode >= 400 && statusCode < 600) return "red";
    if (statusCode >= 100 && statusCode < 200) return "yellow";
    return "gray";
  };

  // Month navigation
  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
  };
  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
  };

  const monthLabel = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="home-container">
      <div className="home-heading">
        <h2>Home</h2>
      </div>

      <div className="api-container">
        <div className="api-display-container" ref={containerRef}>
          <div className="status-header">
            <span>System status</span>

            {/* Month selector */}
            <div className="month-navigation">
              <button onClick={prevMonth}>◀</button>
              <span style={{ margin: "0 1rem" }}>{monthLabel}</span>
              <button onClick={nextMonth}>▶</button>
            </div>
          </div>

          {loading ? (
            <p>Loading APIs...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : visibleApis.length === 0 ? (
            <p>No APIs found for this month.</p>
          ) : (
            visibleApis.map((api, index) => {
              const statuses = Array.isArray(api.statuses) ? api.statuses : [];
              const lastStatus = statuses.length ? statuses[statuses.length - 1] : null;
              const lastOk = lastStatus?.statusCode >= 200 && lastStatus?.statusCode < 300;

              return (
                <div className="status-row" key={api._id || index}>
                  <span className="api-name">
                    {index + 1}. {api.name}
                  </span>
                  <div className="status-blocks">
                    {statuses.map((s, i) => (
                      <span key={i} className={`status-block ${getBlockColor(s.statusCode)}`}></span>
                    ))}
                    {lastStatus &&
                      (lastOk ? <span className="status-check">✔</span> : <span className="status-cross">✖</span>)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
