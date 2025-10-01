const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const ApiStatus = require("./models/apiStatusSchema");
const TracerLog = require("./models/tracerSchema");
const TracerKey = require("./models/tracerKeySchema"); // new
const apiRoutes = require("./routes/apiRoute");
const tracerMiddleware = require("./middleware/tracerMiddleware");
const configRoute = require("./routes/configRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// History limit
const HISTORY_LIMIT = parseInt(process.env.STATUS_HISTORY_LIMIT, 10) || 1000;

app.use(cors());
app.use(express.json());

app.use(tracerMiddleware);
app.use("/api", configRoute);

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

    // Accept many credible shapes; normalize below
    let {
      apiName,
      method,
      statusCode,
      responseTimeMs,
      steps,
      url,
      endpoint,
      time
    } = req.body;

    // Normalize steps: accept array of strings or array of objects
    if (!steps) steps = [];
    if (!Array.isArray(steps)) {
      // if a single string/object provided, make it an array
      steps = [steps];
    }
    steps = steps.map((s) => {
      if (typeof s === "string") return { message: s, timestamp: new Date() };
      // if it has message property keep it, else attempt to stringify
      if (s && typeof s === "object") {
        // ensure timestamp exists
        if (!s.timestamp) s.timestamp = new Date();
        return s;
      }
      return { message: String(s), timestamp: new Date() };
    });

    // Validate required fields robustly (allow 0 values for numbers)
    const isValidApiName = typeof apiName === "string" && apiName.trim().length > 0;
    const isValidStatusCode = typeof statusCode === "number" && Number.isFinite(statusCode);
    const isValidResponseTime = typeof responseTimeMs === "number" && Number.isFinite(responseTimeMs);
    const isValidUrl = typeof url === "string" && url.trim().length > 0;

    if (!isValidApiName || !isValidStatusCode || !isValidResponseTime || !Array.isArray(steps) || !isValidUrl) {
      return res.status(400).json({ message: "Missing or invalid required fields (apiName, statusCode:number, responseTimeMs:number, steps:array, url)" });
    }

    const tracerLog = new TracerLog({
      apiName,
      method: typeof method === "string" ? method : "GET",
      statusCode,
      responseTimeMs,
      steps,
      url,
      endpoint: typeof endpoint === "string" ? endpoint : url,
      time: typeof time !== "undefined" ? time : responseTimeMs
    });

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
