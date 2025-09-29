const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const ApiStatus = require("./models/apiStatusSchema");
const apiRoutes = require("./routes/apiRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// History limit (use env or default to 1000)
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

// Cron job: check APIs every minute
cron.schedule("* * * * *", async () => {
  console.log("🕒 Cron job running...");

  try {
    const apis = await ApiStatus.find();

    for (const api of apis) {
      const startTs = Date.now();
      let statusCode = 0;
      let responseTimeMs = null;

      try {
        const response = await fetch(api.endpoint); // Node 18+ has global fetch
        statusCode = response.status || 0;
        responseTimeMs = Date.now() - startTs;
      } catch (err) {
        statusCode = 0; // could not connect
        responseTimeMs = Date.now() - startTs;
      }

      // Push new structured status into history
      api.statuses.push({
        statusCode,
        timestamp: new Date(),
        responseTimeMs
      });

      // Keep history bounded by HISTORY_LIMIT (configurable)
      if (api.statuses.length > HISTORY_LIMIT) {
        api.statuses = api.statuses.slice(-HISTORY_LIMIT);
      }

      api.lastChecked = new Date();
      await api.save();
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
