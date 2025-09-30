const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");

// GET /status?month=&year=&page=&limit=
router.get("/status", async (req, res) => {
  try {
    let { page = 1, limit = 20, month, year } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    month = parseInt(month); // 1–12
    year = parseInt(year);

    if (!month || !year) {
      return res.status(400).json({ message: "month and year required" });
    }

    const fromDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const toDate = new Date(year, month, 0, 23, 59, 59, 999);

    const allApis = await ApiStatus.find().sort({ name: 1 });

    const filteredApis = allApis.map(api => {
      const statuses = api.statuses.filter(s => {
        if (!s.timestamp) return false;
        const t = new Date(s.timestamp);
        return t >= fromDate && t <= toDate;
      });

      return {
        _id: api._id,
        name: api.name,
        endpoint: api.endpoint,
        statuses,
        lastChecked: api.lastChecked
      };
    });

    const totalPages = Math.max(1, Math.ceil(filteredApis.length / limit));
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filteredApis.slice(start, end);

    res.json({
      data: paginatedData,
      pagination: { currentPage: page, totalPages }
    });
  } catch (err) {
    console.error("Error fetching statuses:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// NEW: GET /stats
router.get("/stats", async (req, res) => {
  try {
    const allApis = await ApiStatus.find();

    let totalRequests = 0;
    let totalResponseTime = 0;
    let errorCounts = {};
    let dailyUptimeMap = {};

    let lastDowntime = null;
    let peakLatency = 0;
    let peakLatencyTimestamp = null;

    for (const api of allApis) {
      for (const s of api.statuses) {
        totalRequests++;
        totalResponseTime += s.responseTimeMs || 0;

        // Track errors
        if (s.statusCode >= 400) {
          errorCounts[s.statusCode] = (errorCounts[s.statusCode] || 0) + 1;
          if (!lastDowntime || new Date(s.timestamp) > new Date(lastDowntime)) {
            lastDowntime = s.timestamp;
          }
        }

        // Peak latency
        if (s.responseTimeMs && s.responseTimeMs > peakLatency) {
          peakLatency = s.responseTimeMs;
          peakLatencyTimestamp = s.timestamp;
        }

        // Daily uptime calculation
        const dateKey = new Date(s.timestamp).toISOString().split("T")[0]; // YYYY-MM-DD
        if (!dailyUptimeMap[dateKey]) dailyUptimeMap[dateKey] = { total: 0, success: 0 };
        dailyUptimeMap[dateKey].total++;
        if (s.statusCode >= 200 && s.statusCode < 400) dailyUptimeMap[dateKey].success++;
      }
    }

    // Daily uptime array
    const dailyUptime = Object.keys(dailyUptimeMap)
      .sort()
      .map(date => ({
        date,
        uptime: ((dailyUptimeMap[date].success / dailyUptimeMap[date].total) * 100).toFixed(1)
      }));

    // Most common error
    let mostCommonError = null;
    let maxErrorCount = 0;
    for (const code in errorCounts) {
      if (errorCounts[code] > maxErrorCount) {
        mostCommonError = parseInt(code);
        maxErrorCount = errorCounts[code];
      }
    }

    const stats = {
      uptime: totalRequests
        ? ((totalRequests - Object.values(errorCounts).reduce((a, b) => a + b, 0)) / totalRequests) * 100
        : 100,
      lastDowntime,
      avgResponseTime: totalRequests ? Math.round(totalResponseTime / totalRequests) : 0,
      peakLatency,
      peakLatencyTimestamp,
      requestVolume: totalRequests,
      avgPerDay: dailyUptime.length ? Math.round(totalRequests / dailyUptime.length) : 0,
      errorRate: totalRequests ? (Object.values(errorCounts).reduce((a, b) => a + b, 0) / totalRequests) * 100 : 0,
      mostCommonError,
      dailyUptime
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
