const Redis = require('redis')

const DEFAULT_EXP = 3600
const redisClient = Redis.createClient()

const connectRedis = async () => {
  await redisClient.connect()
}

connectRedis()

module.exports = {
  redisClient,
  DEFAULT_EXP
}
