const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");
const { checkAllApis } = require("../controllers/checkers");

// Get all APIs with their statuses
router.get("/status", async (req, res) => {
  try {
    const apis = await ApiStatus.find().sort({ name: 1 });
    res.json(apis);
  } catch (err) {
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
