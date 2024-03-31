const Redis = require('redis')

const DEFAULT_EXP = 3600
const REDIS_URL = 'redis://red-co4cjksf7o1s738r13rg:6379'
const redisClient = Redis.createClient(REDIS_URL)

redisClient.on('connect', () => {
    console.log('Connected to Redis')
    // Now that the client is connected, you can start using it
    // Example: redisClient.get('key', (err, reply) => { /* handle response */ });
})

redisClient.connect()

redisClient.on('error', (err) => {
    console.error('Redis error:', err)
})

module.exports = {
    redisClient,
    DEFAULT_EXP
}
