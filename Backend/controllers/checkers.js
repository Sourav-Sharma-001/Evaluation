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

    api.statuses.push(code);
    if (api.statuses.length > 100) {
      api.statuses.shift(); // keep history bounded (100). adjust as needed
    }
    api.lastChecked = new Date();
    await api.save();
  }
  return { checked: apis.length };
}

module.exports = { checkAllApis };
