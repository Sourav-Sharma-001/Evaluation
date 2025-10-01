const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const tracerLogSchema = new mongoose.Schema({
  apiName: { type: String, required: true },
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  url: { type: String, required: true },
  responseTimeMs: { type: Number, required: true },
  steps: { type: [stepSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TracerLog", tracerLogSchema);
