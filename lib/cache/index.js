const redis = require('./redis');
const config = require('../../config');
const memoryCache = require('memory-cache');

memoryCache.getAsync = key => Promise.resolve(memoryCache.get(key));

// eslint-disable-next-line max-len
memoryCache.putAsync = (key, val, ttl, timeoutCallback) => Promise.resolve(memoryCache.put(key, val, ttl, timeoutCallback));

function redisStatus() {
  return redis.status;
}

function cacheClient() {
  if (config.REDIS_URL) {
    return redis;
  }
  return memoryCache;
}

module.exports = {
  redisStatus,
  cacheClient,
};
