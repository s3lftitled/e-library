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


module.exports = { logger, errorLogger }
