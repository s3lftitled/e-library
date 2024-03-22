const getLibraryStatistics =  async (req, res, userRepository) => {
  try {
    const { elibraryStats, totalCount } = await userRepository.getTotalUserCount()
    
    res.status(200).json({ elibraryStats, totalCount })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const visitorStatistics = async (req, res, visitorRepository) => {
  try {
    const today = new Date(new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila' }))
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

    const dailyStats = await visitorRepository.getVisitorStatistics(today)
    const weeklyStats = await visitorRepository.getVisitorStatistics(oneWeekAgo)
    const monthlyStats = await visitorRepository.getVisitorStatistics(oneMonthAgo)

    res.json({
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = { getLibraryStatistics, visitorStatistics }