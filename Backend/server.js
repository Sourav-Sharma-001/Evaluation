const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const { checkAllApis } = require("./controllers/checker");
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
  try {
    const result = await checkAllApis();
    console.log("🕒 Cron checked APIs:", result);
  } catch (err) {
    console.error("Cron failed:", err);
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
