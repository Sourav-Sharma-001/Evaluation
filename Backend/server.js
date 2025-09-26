const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const ApiStatus = require("./models/apiStatusSchema");
const apiRoutes = require("./routes/apiRoute");

const app = express();
const PORT = process.env.PORT || 5000;

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
      const start = Date.now();
      let statusCode = 0;

      try {
        const response = await fetch(api.endpoint);
        statusCode = response.status;
      } catch {
        statusCode = 0; // could not connect
      }

      api.statuses.push({ statusCode, timestamp: new Date() });

      if (api.statuses.length > 30) {
        api.statuses = api.statuses.slice(-30);
      }

      api.lastChecked = new Date();
      await api.save();
    }
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
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
