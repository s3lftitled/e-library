/**
 * Retrieve library statistics including total user count and statistics for each program.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} userRepository - The user repository object.
 */
const getLibraryStatistics = async (req, res, userRepository) => {
  try {
    // Fetch library statistics from the user repository
    const { elibraryStats, totalCount } = await userRepository.getTotalUserCount()
    
    // Send response with library statistics
    res.status(200).json({ elibraryStats, totalCount })
  } catch (error) {
    // Handle errors and send error response
    res.status(500).json({ error: error.message })
  }
}

/**
 * Retrieve visitor statistics including daily, weekly, and monthly visitor counts.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} visitorRepository - The visitor repository object.
 */
const visitorStatistics = async (req, res, visitorRepository) => {
  try {
    // Calculate date ranges for today, one week ago, and one month ago
    const today = new Date(new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila' }))
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

    // Fetch visitor statistics for daily, weekly, and monthly ranges
    const dailyStats = await visitorRepository.getVisitorStatistics(today)
    const weeklyStats = await visitorRepository.getVisitorStatistics(oneWeekAgo)
    const monthlyStats = await visitorRepository.getVisitorStatistics(oneMonthAgo)

    // Send response with visitor statistics
    res.json({
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats
    })
  } catch (error) {
    // Handle errors and send error response
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = { getLibraryStatistics, visitorStatistics }
