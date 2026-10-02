const healthService = require('../services/healthService');
const { sendSuccess } = require('../utils/response');

async function getHealth(req, res) {
  const health = await healthService.getHealth();
  return sendSuccess(res, health);
}

module.exports = { getHealth };
