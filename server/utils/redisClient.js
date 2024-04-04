const IORedis = require('ioredis')
const dotenv = require('dotenv')
dotenv.config()

const DEFAULT_EXP = 3600

const redisClient = new IORedis("rediss://red-co4h3pa1hbls73bt555g:hauBLD7vF8I1Z6Hm9tj8liAdXumIuh8C@oregon-redis.render.com:6379")

redisClient.connect(() => console.log('Redis connected'))

module.exports = {
    redisClient,
    DEFAULT_EXP
}
