const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");
const { checkAllApis } = require("../controllers/checkers");

// Get all APIs with their statuses (paginated + month filter)
router.get("/status", async (req, res) => {
  try {
    let { page = 1, limit = 5, month, year } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    month = parseInt(month); // 1-12
    year = parseInt(year);

    if (!month || !year) {
      return res.status(400).json({ message: "month and year required" });
    }

    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month

    // Fetch all APIs
    const allApis = await ApiStatus.find().sort({ name: 1 });

    // Filter statuses by month
    const filteredApis = allApis.map(api => {
      const statuses = api.statuses.filter(s => {
        if (!s.timestamp) return true;
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

    // Pagination only on APIs list
    const totalPages = Math.max(1, Math.ceil(filteredApis.length / limit));
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filteredApis.slice(start, end);

    res.json({
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages
      }
    });
  } catch (err) {
    console.error("Error fetching statuses:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new API entry
router.post("/status", async (req, res) => {
  try {
    const { name, endpoint } = req.body;
    if (!name || !endpoint) {
      return res.status(400).json({ message: "name and endpoint required" });
    }

    const api = new ApiStatus({
      name,
      endpoint,
      statuses: [] // start with empty history
    });

    await api.save();
    res.status(201).json(api);
  } catch (err) {
    console.error("Error creating API entry:", err);
    res.status(500).json({ message: err.message });
  }
});

// Manual trigger to check all APIs (calls checker)
router.post("/check", async (req, res) => {
  try {
    const result = await checkAllApis();
    res.json(result);
  } catch (err) {
    console.error("Error checking APIs:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
