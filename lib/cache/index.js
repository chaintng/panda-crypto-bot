const redis = require('./redis')
const config = require('../../config')
const memoryCache = require('memory-cache');

memoryCache.getAsync = (key) => {
  return Promise.resolve(memoryCache.get(key))
}

memoryCache.putAsync = (key, val, ttl, timeoutCallback) => {
  return Promise.resolve(memoryCache.put(key, val, ttl, timeoutCallback))
}

function redisStatus() {
  return redis.status
}

function cacheClient() {
  if (config.REDIS_URL) {
    return redis
  } else {
    return memoryCache
  }
}

module.exports = {
  redisStatus,
  cacheClient
}