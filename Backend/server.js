const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const ApiStatus = require("./models/apiStatusSchema");
const TracerLog = require("./models/tracerSchema");
const TracerKey = require("./models/tracerKeySchema"); // new
const apiRoutes = require("./routes/apiRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// History limit
const HISTORY_LIMIT = parseInt(process.env.STATUS_HISTORY_LIMIT, 10) || 1000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running...");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Use routes
app.use("/api", apiRoutes);

const tracerRoute = require("./routes/tracerRoute");
app.use("/private-tracer", tracerRoute);

// Secure Tracer POST endpoint
app.post("/tracer/log", async (req, res) => {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey) return res.status(401).json({ message: "API key missing" });

    const keyDoc = await TracerKey.findOne({ key: apiKey });
    if (!keyDoc) return res.status(401).json({ message: "Invalid API key" });

    const { apiName, method, statusCode, responseTimeMs, steps, url, endpoint, time } = req.body;
    if (!apiName || !statusCode || !responseTimeMs || !Array.isArray(steps) || !url) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const tracerLog = new TracerLog({ apiName, method, statusCode, responseTimeMs, steps, url, endpoint, time });
    await tracerLog.save();

    res.status(201).json({ message: "Log saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Cron job: check APIs every minute
cron.schedule("* * * * *", async () => {
  console.log("🕒 Cron job running...");

  try {
    const apis = await ApiStatus.find();

    for (const api of apis) {
      const startTs = Date.now();
      let statusCode = 0;
      let responseTimeMs = null;

      const steps = [];

      try {
        steps.push({ message: "Request sent", timestamp: new Date() });

        const response = await fetch(api.endpoint);
        statusCode = response.status || 0;
        responseTimeMs = Date.now() - startTs;

        steps.push({ message: "Response received", timestamp: new Date() });
      } catch (err) {
        statusCode = 0;
        responseTimeMs = Date.now() - startTs;
        steps.push({ message: "Request failed", timestamp: new Date() });
      }

      // Push status to ApiStatus
      api.statuses.push({
        statusCode,
        timestamp: new Date(),
        responseTimeMs
      });

      if (api.statuses.length > HISTORY_LIMIT) {
        api.statuses = api.statuses.slice(-HISTORY_LIMIT);
      }

      api.lastChecked = new Date();
      await api.save();

      // Create TracerLog (cron-generated)
      const tracerLog = new TracerLog({
        apiName: api.name,
        endpoint: api.endpoint,
        method: "GET",
        url: api.endpoint,
        time: responseTimeMs,
        steps
      });

      await tracerLog.save();
    }
  } catch (err) {
    console.error("❌ Cron job error:", err.message || err);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
