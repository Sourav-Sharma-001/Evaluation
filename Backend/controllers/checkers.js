const ApiStatus = require("../models/apiStatusSchema");

async function checkAllApis() {
  const apis = await ApiStatus.find();
  for (const api of apis) {
    let code = 0;
    try {
      const response = await fetch(api.endpoint, { method: "GET" });
      code = response.status;
    } catch (err) {
      code = 500; // treat fetch error as server error
    }

    api.statuses.push({ statusCode: code, timestamp: new Date() });

    if (api.statuses.length > 100) {
      api.statuses.shift(); // keep history bounded
    }

    api.lastChecked = new Date();
    await api.save();
  }
  return { checked: apis.length };
}

module.exports = { checkAllApis };
