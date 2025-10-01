const mongoose = require("mongoose");
const TracerKey = require("./models/tracerKeySchema");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected for key generation");
    
    const key = uuidv4();
    const newKey = new TracerKey({ key, owner: "Demo User" });
    await newKey.save();
    console.log("Generated API key:", key);
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
