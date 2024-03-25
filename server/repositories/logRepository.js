const Log = require('../models/log')

class LogRepository {
  constructor() {
    // Singleton pattern omplementation
    if (!LogRepository.instance) {
      LogRepository.instance = this
    }
    return LogRepository.instance
  }

  // Method to create new log
  async createLog(logData) {
    try {
      const newLog = new Log(logData)
      return await newLog.save()
    } catch (error) {
      throw new Error(`Error creating log: ${error.message}`)
    }
  }

}

module.exports = LogRepository
