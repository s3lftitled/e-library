const { logger } = require('../utils/loggers')

const requestDurationLogger = (req, res, next) => {
  const startTime = Date.now()
  const path = req.originalUrl

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`Handled ${req.method} request for ${path} in ${duration}ms`)
  })

  next()
}

module.exports = requestDurationLogger
