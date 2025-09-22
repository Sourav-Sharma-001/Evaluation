const mongoose = require("mongoose");

const apiStatusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  endpoint: { type: String, required: true },
  statuses: { type: [Number], default: [] }, // history of HTTP status codes
  lastChecked: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ApiStatus", apiStatusSchema);
