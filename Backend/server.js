const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();
const ApiStatus = require("./models/apiStatusSchema");


const { checkAllApis } = require("./controllers/checkers");
const apiRoutes = require("./routes/apiRoute");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running...");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api", apiRoutes);

// Cron: run checkAllApis every minute
cron.schedule("* * * * *", async () => {
  console.log("🕒 Cron job running every minute");

  const apis = await ApiStatus.find(); // fetch all APIs to check

  for (const api of apis) {
    const start = Date.now();
    let status = "offline";

    try {
      const response = await fetch(api.endpoint);
      status = response.ok ? "online" : "offline";
    } catch {
      status = "offline";
    }

    await ApiStatus.create({
      name: api.name,
      endpoint: api.endpoint,
      status: status,
      responseTime: Date.now() - start,
      lastChecked: new Date()
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
