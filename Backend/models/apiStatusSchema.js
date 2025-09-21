const mongoose = require("mongoose");

const apiStatusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  endpoint: { type: String, required: true },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  responseTime: { type: Number, default: 0 },
  lastChecked: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ApiStatus", apiStatusSchema);
