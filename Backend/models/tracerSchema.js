const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const tracerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  steps: { type: [stepSchema], default: [] }, // array of objects
  url: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TracerLog", tracerSchema);
