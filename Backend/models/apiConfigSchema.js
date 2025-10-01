const mongoose = require("mongoose");

const apiConfigSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },       // API name / endpoint identifier
  endpoint: { type: String, required: true },                 // Full URL of API
  startDate: { type: Date, default: Date.now },               // When monitoring started
  enabled: { type: Boolean, default: true },                 // API monitoring ON/OFF
  tracerEnabled: { type: Boolean, default: true },           // Should tracer be enabled
  limit: { type: Number, default: 0 },                        // Request limit
  rate: { type: String, enum: ["sec", "min", "hour"], default: "sec" }, // Rate period
  schedule: {
    startTime: { type: String, default: "00:00" },           // Schedule start time (HH:mm)
    endTime: { type: String, default: "23:59" },             // Schedule end time
    enabled: { type: Boolean, default: false },              // Schedule ON/OFF
  },
});

module.exports = mongoose.model("ApiConfig", apiConfigSchema);
