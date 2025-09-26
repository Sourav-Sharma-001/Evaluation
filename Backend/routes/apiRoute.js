const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");
const { checkAllApis } = require("../controllers/checkers");

// Get all APIs with their statuses (paginated + date range)
router.get("/status", async (req, res) => {
  try {
    const { from, to, page = 1 } = req.query;
    const limit = 5; // APIs per page
    const skip = (page - 1) * limit;

    // Date filtering
    let matchDates = {};
    if (from || to) {
      matchDates = {
        "statuses.timestamp": {}
      };
      if (from) matchDates["statuses.timestamp"].$gte = new Date(from);
      if (to) matchDates["statuses.timestamp"].$lte = new Date(to);
    }

    const totalApis = await ApiStatus.countDocuments();
    const totalPages = Math.ceil(totalApis / limit);

    const apis = await ApiStatus.find(matchDates)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(); // lean() for plain JS objects

    res.json({
      data: apis,
      pagination: {
        currentPage: Number(page),
        totalPages
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
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
