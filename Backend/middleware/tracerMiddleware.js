const fetch = require("node-fetch"); // use node-fetch or global fetch in Node 18+
require("dotenv").config();

const TRACER_API_URL = process.env.PRIVATE_TRACER_URL || "http://localhost:5000/private-tracer/log";
const TRACER_API_KEY = process.env.TRACER_API_KEY;

const tracerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // After response is finished
  res.on("finish", async () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const logData = {
      timestamp: new Date().toISOString(),
      apiName: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: responseTime,
    };

    try {
      await fetch(TRACER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TRACER_API_KEY,
        },
        body: JSON.stringify(logData),
      });
    } catch (err) {
      console.error("Tracer log failed:", err.message);
    }
  });

  next();
};

module.exports = tracerMiddleware;
