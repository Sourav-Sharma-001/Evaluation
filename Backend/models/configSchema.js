const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  apiName: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  scheduleOn: { type: Boolean, default: false },
  requestLimit: { type: Number, default: 0 },
  rateUnit: { type: String, enum: ["sec", "min", "hour"], default: "sec" },
  tracerOn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Config", configSchema);
