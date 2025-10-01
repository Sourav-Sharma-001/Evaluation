const express = require("express");
const router = express.Router();
const TracerLog = require("../models/tracerSchema");
const TracerKey = require("../models/tracerKeySchema");

// Middleware: Validate x-api-key
const validateApiKey = async (req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key) return res.status(401).json({ message: "API key required" });

  const validKey = await TracerKey.findOne({ key });
  if (!validKey) return res.status(401).json({ message: "Invalid API key" });

  // Optional: check expiry
  if (validKey.expiresAt && new Date() > validKey.expiresAt) {
    return res.status(401).json({ message: "API key expired" });
  }

  next();
};

// POST /tracer/log
router.post("/log", validateApiKey, async (req, res) => {
  try {
    const { apiName, endpoint, statusCode, responseTimeMs, steps } = req.body;

    if (!apiName || !endpoint || statusCode == null || responseTimeMs == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const formattedSteps = Array.isArray(steps)
      ? steps.map(s => (typeof s === "string" ? { message: s } : s))
      : [];

    const log = new TracerLog({
      apiName,
      endpoint,
      statusCode,
      responseTimeMs,
      steps: formattedSteps,
    });

    await log.save();
    res.status(201).json({ message: "Log saved" });
  } catch (err) {
    console.error("Error saving tracer log:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
