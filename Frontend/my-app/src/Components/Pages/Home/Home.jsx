import React, { useEffect, useState, useRef, memo, useCallback } from "react";
import "./Home.css";

// Memoized API Row
const ApiRow = memo(function ApiRow({ api, index, getBlockColor }) {
  const statuses = Array.isArray(api.statuses) ? api.statuses : [];
  const lastStatus = statuses.length ? statuses[statuses.length - 1] : null;
  const lastOk = lastStatus?.statusCode >= 200 && lastStatus?.statusCode < 300;

  return (
    <div className="status-row">
      <span className="api-name">
        {index + 1}. {api.name}
        {lastStatus &&
          (lastOk ? (
            <span className="status-badge-check">✔</span>
          ) : (
            <span className="status-badge-cross">✖</span>
          ))}
      </span>

      <div className="status-blocks">
        {statuses.map((s, i) => (
          <span
            key={i}
            className={`status-block ${getBlockColor(s.statusCode)}`}
          ></span>
        ))}
      </div>
    </div>
  );
});

export default function Home() {
  const [allApis, setAllApis] = useState([]);
  const [visibleApis, setVisibleApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date("2025-01-01"));
  const [visibleCount, setVisibleCount] = useState(20);
  const containerRef = useRef(null);

  const getMonthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const getBlockColor = useCallback((statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return "green";
    if (statusCode >= 300 && statusCode < 400) return "orange";
    if (statusCode >= 400 && statusCode < 600) return "red";
    if (statusCode >= 100 && statusCode < 200) return "yellow";
    return "gray";
  }, []);

  // Fetch statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        setError(null);

        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();

        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/status?month=${month}&year=${year}`
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

  // Infinite scroll
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

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const monthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="home-container">
      <div className="home-heading">
        <h2>Home</h2>
      </div>

      <div className="api-container">
        <div className="api-display-container" ref={containerRef}>
          <div className="status-header">
            <span>System status</span>
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
            visibleApis.map((api, index) => (
              <ApiRow
                key={api._id || index}
                api={api}
                index={index}
                getBlockColor={getBlockColor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
