const express = require("express");
const router = express.Router();
const Config = require("../models/configSchema");

// GET /api/config → fetch all configs
router.get("/config", async (req, res) => {
  try {
    const configs = await Config.find().sort({ apiName: 1 });
    res.json({ data: configs });
  } catch (err) {
    console.error("Error fetching configs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/config → save/update config
router.post("/config", async (req, res) => {
  try {
    const {
      apiName,
      startDate,
      scheduleOn,
      requestLimit,
      rateUnit,
      tracerOn,
    } = req.body;

    if (!apiName || !startDate) {
      return res
        .status(400)
        .json({ message: "apiName and startDate are required" });
    }

    const config = await Config.findOneAndUpdate(
      { apiName },
      { startDate, scheduleOn, requestLimit, rateUnit, tracerOn },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: "Config saved", data: config });
  } catch (err) {
    console.error("Error saving config:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
