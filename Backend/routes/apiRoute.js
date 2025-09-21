const express = require("express");
const router = express.Router();
const ApiStatus = require("../models/apiStatusSchema");
const fetch = require("node-fetch");

// Get all APIs
router.get("/status", async (req, res) => {
  try {
    const apis = await ApiStatus.find();
    res.json(apis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check and update API status
router.post("/check", async (req, res) => {
  try {
    const apis = await ApiStatus.find();

    for (const api of apis) {
      const start = Date.now();
      try {
        const response = await fetch(api.endpoint);
        api.status = response.ok ? "online" : "offline";
      } catch {
        api.status = "offline";
      }
      api.responseTime = Date.now() - start;
      api.lastChecked = new Date();
      await api.save();
    }

    res.json({ message: "API statuses updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
