const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");
const { checkAllApis } = require("../controllers/checkers");

// Get all APIs with pagination + time filtering
router.get("/status", async (req, res) => {
  const { from, to, page = 1 } = req.query;
  const limit = 30;

  try {
    const fromDate = from ? new Date(from) : new Date("1970-01-01");
    const toDate = to ? new Date(to) : new Date();

    const allApis = await ApiStatus.find().sort({ name: 1 });

    const filteredApis = allApis.map(api => {
      const filteredStatuses = api.statuses.filter(s => {
        const ts = new Date(s.timestamp);
        return ts >= fromDate && ts <= toDate;
      });
      return {
        _id: api._id,
        name: api.name,
        endpoint: api.endpoint,
        statuses: filteredStatuses,
      };
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedData = filteredApis.slice(start, end);

    res.json({
      data: pagedData,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(filteredApis.length / limit),
      },
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
