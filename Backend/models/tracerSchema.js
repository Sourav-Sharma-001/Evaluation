const mongoose = require("mongoose");

const TracerLogSchema = new mongoose.Schema(
  {
    apiName: { type: String, required: true },
    method: { type: String, required: true, default: "GET" },
    url: { type: String, required: true },
    endpoint: { type: String },        // optional, auto-filled from url
    statusCode: { type: Number },      // optional, auto-filled
    responseTimeMs: { type: Number },  // optional, auto-filled
    steps: { type: [Object] },         // optional, auto-filled
    time: { type: Number }             // optional, auto-filled
  },
  { timestamps: true }
);

module.exports = mongoose.model("TracerLog", TracerLogSchema);
