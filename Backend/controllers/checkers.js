const ApiStatus = require("../models/apiStatusSchema");
import fetch from 'node-fetch';

// Use same limit as server; configurable via env
const HISTORY_LIMIT = parseInt(process.env.STATUS_HISTORY_LIMIT, 10) || 1000;

async function checkAllApis() {
  const apis = await ApiStatus.find();
  for (const api of apis) {
    let code = 0;
    let responseTimeMs = null;
    const startTs = Date.now();

    try {
      const response = await fetch(api.endpoint, { method: "GET" });
      code = response.status;
      responseTimeMs = Date.now() - startTs;
    } catch (err) {
      code = 0; // treat fetch error as connectivity failure
      responseTimeMs = Date.now() - startTs;
    }

    api.statuses.push({
      statusCode: code,
      timestamp: new Date(),
      responseTimeMs,
      logType: code === 0 ? "ERROR" : "INFO",  // simple rule
      requestMethod: "GET",
      endpoint: api.endpoint,
      message: code === 0 ? "Request failed" : "Checked successfully"
    });

    // keep bounded history; increase limit if needed via env
    if (api.statuses.length > HISTORY_LIMIT) {
      api.statuses = api.statuses.slice(-HISTORY_LIMIT);
    }

    api.lastChecked = new Date();
    await api.save();
  }
  return { checked: apis.length };
}

module.exports = { checkAllApis };
