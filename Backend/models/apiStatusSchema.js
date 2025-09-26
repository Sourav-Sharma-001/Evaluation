const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  statusCode: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const apiStatusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  endpoint: { type: String, required: true },
  statuses: { type: [statusSchema], default: [] },
  lastChecked: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ApiStatus", apiStatusSchema);
