const config = require('../config');
const cache = require('../lib/cache');

const healthyCheck = (req, res) => {
  const status = (config.redisUrl && cache.redisStatus() === 'ready') || !config.redisUrl ? 'ok' : 'failed';
  const returnObj = {
    status,
    redis_status: cache.redisStatus() || 'N/A',
  };

  return res.json(returnObj);
};

module.exports = healthyCheck;
