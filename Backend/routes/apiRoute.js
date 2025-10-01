const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");
const TracerLog = require("../models/tracerSchema"); // tracer logs model

// GET /status?month=&year=&page=&limit=
router.get("/status", async (req, res) => {
  try {
    let { page = 1, limit = 20, month, year } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    month = parseInt(month);
    year = parseInt(year);

    if (!month || !year) {
      return res.status(400).json({ message: "month and year required" });
    }

    const fromDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const toDate = new Date(year, month, 0, 23, 59, 59, 999);

    const allApis = await ApiStatus.find().sort({ name: 1 });

    const filteredApis = allApis.map((api) => {
      const statuses = api.statuses.filter((s) => {
        if (!s.timestamp) return false;
        const t = new Date(s.timestamp);
        return t >= fromDate && t <= toDate;
      });

      return {
        _id: api._id,
        name: api.name,
        endpoint: api.endpoint,
        statuses,
        lastChecked: api.lastChecked,
      };
    });

    const totalPages = Math.max(1, Math.ceil(filteredApis.length / limit));
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filteredApis.slice(start, end);

    res.json({
      data: paginatedData,
      pagination: { currentPage: page, totalPages },
    });
  } catch (err) {
    console.error("Error fetching statuses:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /stats?month=&year=
router.get("/stats", async (req, res) => {
  try {
    let { month, year } = req.query;
    month = parseInt(month);
    year = parseInt(year);

    if (!month || !year) {
      return res.status(400).json({ message: "month and year required" });
    }

    const fromDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const toDate = new Date(year, month, 0, 23, 59, 59, 999);
    const totalDays = toDate.getDate();

    const allApis = await ApiStatus.find();

    let totalRequests = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    let responseTimes = [];
    let errorCounts = {};

    const dailyUptime = Array.from({ length: totalDays }, (_, i) => ({
      date: new Date(year, month - 1, i + 1),
      success: 0,
      total: 0,
    }));

    allApis.forEach((api) => {
      const monthStatuses = api.statuses.filter(
        (s) =>
          s.timestamp &&
          new Date(s.timestamp) >= fromDate &&
          new Date(s.timestamp) <= toDate
      );

      monthStatuses.forEach((s) => {
        totalRequests++;
        responseTimes.push(s.responseTimeMs || 0);

        const statusCode = s.statusCode;
        if (statusCode >= 200 && statusCode < 300) totalSuccess++;
        else if (statusCode >= 400) totalErrors++;

        if (statusCode >= 400) {
          errorCounts[statusCode] = (errorCounts[statusCode] || 0) + 1;
        }

        const dayIndex = new Date(s.timestamp).getDate() - 1;
        dailyUptime[dayIndex].total++;
        if (statusCode >= 200 && statusCode < 300) dailyUptime[dayIndex].success++;
      });
    });

    const uptime = totalRequests ? (totalSuccess / totalRequests) * 100 : 100;
    const avgResponseTime = responseTimes.length
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    const peakLatency = responseTimes.length ? Math.max(...responseTimes) : 0;
    const peakLatencyTimestamp =
      allApis
        .flatMap((a) => a.statuses)
        .find((s) => s.responseTimeMs === peakLatency)?.timestamp || null;
    const errorRate = totalRequests ? (totalErrors / totalRequests) * 100 : 0;
    const mostCommonError = Object.keys(errorCounts).length
      ? Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;
    const lastDowntime =
      allApis
        .flatMap((a) => a.statuses)
        .filter((s) => s.statusCode >= 400)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp ||
      null;

    const chartData = dailyUptime.map((d) => ({
      date: d.date,
      uptime: d.total ? (d.success / d.total) * 100 : 100,
    }));

    res.json({
      uptime,
      avgResponseTime,
      peakLatency,
      peakLatencyTimestamp,
      requestVolume: totalRequests,
      avgPerDay: totalRequests ? Math.round(totalRequests / totalDays) : 0,
      errorRate,
      mostCommonError,
      lastDowntime,
      dailyUptime: chartData,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /tracer/logs
router.get("/tracer/logs", async (req, res) => {
  try {
    const logs = await TracerLog.find().sort({ createdAt: -1 }).lean();

    const today = [];
    const yesterday = [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    logs.forEach((log) => {
      const logDate = new Date(log.createdAt);
      if (logDate >= todayStart) today.push(log);
      else if (logDate >= yesterdayStart && logDate < todayStart) yesterday.push(log);
    });

    res.json({ today, yesterday });
  } catch (err) {
    console.error("Error fetching tracer logs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
