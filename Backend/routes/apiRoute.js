const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");

// GET /status?month=&year=
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

    // Range for the given month
    const fromDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const toDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all APIs
    const allApis = await ApiStatus.find().sort({ name: 1 });

    // Filter statuses to only keep those within the month
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

    // Pagination
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

module.exports = router;
