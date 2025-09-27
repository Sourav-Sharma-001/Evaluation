const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");
const { checkAllApis } = require("../controllers/checkers");

// Get all APIs with their statuses (paginated + date filter)
router.get("/status", async (req, res) => {
  try {
    let { page = 1, limit = 5, from, to } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build date filter if provided
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    // Fetch all APIs
    const allApis = await ApiStatus.find().sort({ name: 1 });

    // Filter statuses by date
    const filteredApis = allApis.map(api => {
      const statuses = api.statuses.filter(s => {
        if (!s.timestamp) return true; // keep if timestamp missing
        const t = new Date(s.timestamp);
        if (dateFilter.$gte && t < dateFilter.$gte) return false;
        if (dateFilter.$lte && t > dateFilter.$lte) return false;
        return true;
      });
      return {
        _id: api._id,
        name: api.name,
        endpoint: api.endpoint,
        statuses,
        lastChecked: api.lastChecked
      };
    });

    const totalPages = Math.ceil(filteredApis.length / limit);
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
    console.error(err);
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
    const api = new ApiStatus({ name, endpoint, statuses: [] });
    await api.save();
    res.status(201).json(api);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manual trigger to check all APIs (calls checker)
router.post("/check", async (req, res) => {
  try {
    const result = await checkAllApis();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
