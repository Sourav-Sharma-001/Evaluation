const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
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

// API routes
const apiRoutes = require("./routes/apiRoute");
app.use("/api", apiRoutes);

// Example Node-cron task (runs every minute)
cron.schedule("* * * * *", async () => {
  console.log("🕒 Cron job running every minute");
  // You can call a function here later to auto-check APIs
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
