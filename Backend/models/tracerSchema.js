const mongoose = require("mongoose");

// Step schema
const stepSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Tracer log schema
const tracerSchema = new mongoose.Schema({
  apiName: { type: String, required: true },
  method: { type: String, default: "GET" },
  url: { type: String, required: true },
  endpoint: { type: String },
  statusCode: { type: Number, default: 0 },
  responseTimeMs: { type: Number, default: 0 },
  steps: { type: [stepSchema], default: [] },
  time: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TracerLog", tracerSchema);
