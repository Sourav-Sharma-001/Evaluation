const mongoose = require("mongoose");

const tracerKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // optional
  owner: { type: String }     // optional description
});

module.exports = mongoose.model("TracerKey", tracerKeySchema);
