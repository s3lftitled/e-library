// responseUtils.js

const errorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({ error: message })
}

const successResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({ success: message, data })
}

module.exports = { errorResponse, successResponse }
