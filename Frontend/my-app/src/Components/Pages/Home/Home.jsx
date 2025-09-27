import React, { useEffect, useState, useRef } from "react";
import "./Home.css";

export default function Home() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time range
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-04-30");

  // Pagination / infinite scroll
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef(null);

  // Fetch API statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        if (page === 1) setLoading(true);

        const res = await fetch(
          `http://localhost:5000/api/status?from=${fromDate}&to=${toDate}&page=${page}`
        );
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const result = await res.json();

        if (Array.isArray(result.data)) {
          if (page === 1) setApis(result.data);
          else setApis(prev => [...prev, ...result.data]);
          setTotalPages(result.pagination?.totalPages || 1);
          setError(null);
        } else {
          if (page === 1) setApis([]);
          setError("API returned unexpected format");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (page === 1) setApis([]);
        setError("Failed to fetch API data");
      } finally {
        if (page === 1) setLoading(false);
      }
    };

    fetchStatuses();
  }, [fromDate, toDate, page]);

  // Infinite scroll observer
  useEffect(() => {
    if (page >= totalPages) return; // stop if last page reached
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPage(prev => prev + 1);
      },
      { root: containerRef.current, threshold: 1.0 }
    );

    const lastApi = containerRef.current?.lastElementChild;
    if (lastApi) observer.observe(lastApi);

    return () => {
      if (lastApi) observer.unobserve(lastApi);
    };
  }, [apis, page, totalPages]);

  // Status color
  const getBlockColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return "green";
    if (statusCode >= 300 && statusCode < 400) return "orange";
    if (statusCode >= 400 && statusCode < 600) return "red";
    if (statusCode >= 100 && statusCode < 200) return "yellow";
    return "gray";
  };

  return (
    <div className="home-container">
      <div className="home-heading">
        <h2>Home</h2>
      </div>

      <div className="api-container">
        <div className="api-display-container" ref={containerRef}>
          <div className="status-header">
            <span>System status</span>

            {/* Time range selector */}
            <div className="time-range">
              <label>
                From:{" "}
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <label>
                To:{" "}
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
            </div>
          </div>

          {loading ? (
            <p>Loading APIs...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : apis.length === 0 ? (
            <p>No APIs found.</p>
          ) : (
            apis.map((api, index) => {
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
                      <span
                        key={i}
                        className={`status-block ${getBlockColor(s.statusCode)}`}
                      ></span>
                    ))}
                    {lastStatus && (
                      lastOk ? (
                        <span className="status-check">✔</span>
                      ) : (
                        <span className="status-cross">✖</span>
                      )
                    )}
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
