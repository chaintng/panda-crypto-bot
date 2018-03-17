const config = require('../../config');
const Redis = require('ioredis');

let redis = new Redis(config.redisUrl, {
  connectTimeout: 1000,
  retryStrategy: () => {
    console.log("Cannot connect to redis")
    return false
  }
});

redis.on('error', (err) => {
  console.error(err)
})

redis.getAsync = redis.get

redis.putAsync = (key, val, ttl) => {
  return redis.set(key, val, 'EX', ttl)
}

module.exports = redis