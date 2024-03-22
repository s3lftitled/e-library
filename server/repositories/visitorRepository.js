const Log = require('../models/log')

class VisitorRepository {
  async getVisitorStatistics(startDate) {
    try {
      const logs = await Log.find({ timestamp: { $gte: startDate } }).populate({ 
        path: 'userId',
        select: 'username'
      }).populate({ 
        path: 'userProgramId',
        model: 'Program',
        select: 'title'
      })

      const uniqueVisitorsMap = new Map();
      logs.forEach(log => {
        const userId = log.userId;
        const programName = log.userProgramId.title
        if (!uniqueVisitorsMap.has(userId)) {
          uniqueVisitorsMap.set(userId, new Set())
        }
        uniqueVisitorsMap.get(userId).add(programName)
      })

      const totalUniqueVisitors = uniqueVisitorsMap.size;
      const programCounts = {};
      uniqueVisitorsMap.forEach((programs) => {
        programs.forEach(program => {
          programCounts[program] = (programCounts[program] || 0) + 1
        })
      })

      return { totalUniqueVisitors, programCounts }
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = VisitorRepository
