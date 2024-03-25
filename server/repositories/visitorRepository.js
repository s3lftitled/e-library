const Log = require('../models/log')

class VisitorRepository {
  constructor() {
    if (!VisitorRepository.instance) {
      VisitorRepository.instance = this
    }
    return this.instance
  }
  // Method to get visitor statistics based on start date
  async getVisitorStatistics(startDate) {
    try {
      // Fetch logs from the database based on the provided start date
      const logs = await Log.find({ timestamp: { $gte: startDate } })
        .populate({ 
          path: 'userId',
          select: 'username'
        })
        .populate({ 
          path: 'userProgramId',
          model: 'Program',
          select: 'title'
        })

      // Initialize a map to store unique visitors and their associated programs
      const uniqueVisitorsMap = new Map()

      // Iterate over logs to populate the uniqueVisitorsMap
      logs.forEach(log => {
        const userId = log.userId
        const programName = log.userProgramId.title

        // If userId is not present in the map, add it with an empty set
        if (!uniqueVisitorsMap.has(userId)) {
          uniqueVisitorsMap.set(userId, new Set())
        }

        // Add programName to the set of programs associated with the userId
        uniqueVisitorsMap.get(userId).add(programName)
      })

      // Calculate total unique visitors
      const totalUniqueVisitors = uniqueVisitorsMap.size

      // Calculate program visit counts
      const programCounts = {}
      uniqueVisitorsMap.forEach((programs) => {
        programs.forEach(program => {
          programCounts[program] = (programCounts[program] || 0) + 1
        })
      })

      // Return an object containing total unique visitors and program visit counts
      return { totalUniqueVisitors, programCounts }
    } catch (error) {
      // Throw error if any occurs during database operation
      throw new Error(error.message)
    }
  }
}

module.exports = VisitorRepository
