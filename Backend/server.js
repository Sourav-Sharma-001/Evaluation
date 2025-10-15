const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

// === CommonJS fetch polyfill for Node.js 22+ ===
const https = require("https");
const http = require("http");

global.fetch = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(
      url,
      { method: options.method || "GET", headers: options.headers || {} },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              text: async () => data,
              json: async () => JSON.parse(data),
            });
          } catch (err) {
            resolve({ status: res.statusCode, text: async () => data });
          }
        });
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
};

const ApiStatus = require("./models/apiStatusSchema");
const TracerLog = require("./models/tracerSchema");
const TracerKey = require("./models/tracerKeySchema");
const apiRoutes = require("./routes/apiRoute");
const configRoute = require("./routes/configRoute");
const tracerMiddleware = require("./middleware/tracerMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// History limit
const HISTORY_LIMIT = parseInt(process.env.STATUS_HISTORY_LIMIT, 10) || 1000;

app.use(cors());
app.use(express.json());

// Attach tracer middleware
app.use(tracerMiddleware);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    // prevent crash loop on Render
    process.exit(1);
  });

// API routes
app.use("/api", apiRoutes);
app.use("/api", configRoute);

const tracerRoute = require("./routes/tracerRoute");
app.use("/private-tracer", tracerRoute);

// Secure Tracer POST endpoint (live calculation)
app.post("/tracer/log", async (req, res) => {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey) return res.status(401).json({ message: "API key missing" });

    const keyDoc = await TracerKey.findOne({ key: apiKey });
    if (!keyDoc) return res.status(401).json({ message: "Invalid API key" });

    let { apiName, method, url, endpoint, steps } = req.body;
    if (!steps) steps = [];

    if (!Array.isArray(steps)) steps = [steps];
    steps = steps.map((s) => {
      if (typeof s === "string") return { message: s, timestamp: new Date() };
      if (s && typeof s === "object") {
        if (!s.timestamp) s.timestamp = new Date();
        return s;
      }
      return { message: String(s), timestamp: new Date() };
    });

    // Validate minimal required fields
    if (!apiName || !method || !url) {
      return res.status(400).json({ message: "Missing required fields: apiName, method, url" });
    }

    const fetchStart = Date.now();
    let statusCode = 0;
    let responseTimeMs = 0;

    try {
      steps.push({ message: "Request sent", timestamp: new Date() });

      const response = await fetch(url, { method });
      statusCode = response.status;
      responseTimeMs = Date.now() - fetchStart;

      steps.push({ message: "Response received", timestamp: new Date() });
    } catch (err) {
      responseTimeMs = Date.now() - fetchStart;
      steps.push({ message: "Request failed", timestamp: new Date() });
      console.error(`❌ API request failed for ${apiName}:`, err.message);
    }

    const tracerLog = new TracerLog({
      apiName,
      method,
      url,
      endpoint: endpoint || url,
      statusCode,
      responseTimeMs,
      steps,
      time: responseTimeMs,
    });

    await tracerLog.save();

    // Update ApiStatus collection
    const apiDoc = await ApiStatus.findOne({ name: apiName });
    if (apiDoc) {
      apiDoc.statuses.push({
        statusCode,
        timestamp: new Date(),
        responseTimeMs,
        logType: statusCode === 0 ? "ERROR" : "INFO",
        requestMethod: method,
        endpoint: endpoint || url,
        message: steps.map(s => s.message).join(" | "),
      });

      if (apiDoc.statuses.length > HISTORY_LIMIT) {
        apiDoc.statuses = apiDoc.statuses.slice(-HISTORY_LIMIT);
      }

      apiDoc.lastChecked = new Date();
      await apiDoc.save();
    }

    res.status(201).json({ message: "API tested successfully", tracerLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// === AUTO UPDATE API STATUS FROM TRACER LOGS (cron every 1 min) ===
cron.schedule("* * * * *", async () => {
  console.log("🕒 Cron job running for tracer logs...");

  try {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    const recentLogs = await TracerLog.find({ createdAt: { $gte: last5Minutes } });

    for (const log of recentLogs) {
      const apiName = log.apiName || "Unknown API";
      const method = log.method || "GET";
      const url = log.url || log.endpoint || "Unknown URL";
      const statusCode = Number.isFinite(log.statusCode) ? log.statusCode : 0;
      const responseTimeMs = Number.isFinite(log.responseTimeMs) ? log.responseTimeMs : 0;
      const message = Array.isArray(log.steps)
        ? log.steps.map((s) => s.message).join(" | ")
        : "";

      const apiDoc = await ApiStatus.findOne({ name: apiName });
      if (apiDoc) {
        apiDoc.statuses.push({
          statusCode,
          timestamp: log.createdAt || new Date(),
          responseTimeMs,
          logType: statusCode === 0 ? "ERROR" : "INFO",
          requestMethod: method,
          endpoint: url,
          message,
        });

        if (apiDoc.statuses.length > HISTORY_LIMIT) {
          apiDoc.statuses = apiDoc.statuses.slice(-HISTORY_LIMIT);
        }

        apiDoc.lastChecked = new Date();
        await apiDoc.save();
      }
    }
  } catch (err) {
    console.error("❌ Cron job error for tracer logs:", err.message || err);
  }
});


// Cron job: existing API checks
cron.schedule("* * * * *", async () => {
  console.log("🕒 Cron job running...");

  try {
    const apis = await ApiStatus.find();

    for (const api of apis) {
      const startTs = Date.now();
      let statusCode = 0;
      let responseTimeMs = 0;
      const steps = [];

      try {
        steps.push({ message: "Request sent", timestamp: new Date() });
        // Only fetch if endpoint is reachable
        if (api.endpoint && api.endpoint.startsWith("http")) {
          const response = await fetch(api.endpoint);
          statusCode = response?.status || 0;
        } else {
          steps.push({ message: "Skipped invalid endpoint", timestamp: new Date() });
        }
        responseTimeMs = Date.now() - startTs;
        steps.push({ message: "Response received", timestamp: new Date() });
      } catch (err) {
        statusCode = 0;
        responseTimeMs = Date.now() - startTs;
        steps.push({ message: "Request failed", timestamp: new Date() });
        console.error(`❌ API check failed for ${api.name}:`, err.message);
      }

      if (!Number.isFinite(statusCode)) statusCode = 0;
      if (!Number.isFinite(responseTimeMs)) responseTimeMs = 0;

      api.statuses.push({ statusCode, timestamp: new Date(), responseTimeMs });

      if (api.statuses.length > HISTORY_LIMIT) {
        api.statuses = api.statuses.slice(-HISTORY_LIMIT);
      }

      api.lastChecked = new Date();
      await api.save();

      const tracerLog = new TracerLog({
        apiName: api.name || "Unknown API",
        endpoint: api.endpoint || "Unknown endpoint",
        method: "GET",
        url: api.endpoint || "Unknown URL",
        statusCode,
        responseTimeMs,
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

// Start server safely
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
