const winston = require('winston')
const { combine, timestamp, json, prettyPrint, errors } = winston.format

// Define log format
const logFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json(),
  prettyPrint() 
)

// Create loggers
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ]
})

const errorLogger = winston.createLogger({
  level: 'error',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ]
})

const requestHandler = (path) => {
  const profiler = logger.startTimer()
  const ONE_BILLION = 1000000000

  for (let i = 0; i < ONE_BILLION; i++) {
    j = i * 2
  }

  profiler.done({ message: `Handled request for ${path}` })
}


module.exports = { logger, errorLogger, requestHandler }
