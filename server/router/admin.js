const User = require('../models/user')
const { Department, Program } = require('../models/e-book')
const express = require('express') 
const router = express.Router()

// Get user statistics (accessible only by librarian)
router.get('/get-statistics', async (req, res) => {
  try {
    const elibraryStats = await User.aggregate([
      {
        $group: {
          _id: '$programID',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: '$count' },
          programs: {
            $push: {
              programID: '$_id',
              count: '$count',
            },
          },
        },
      },
      {
        $unwind: { path: '$programs', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'programs',
          localField: 'programs.programID',
          foreignField: '_id',
          as: 'program',
        },
      },
      {
        $unwind: { path: '$program', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          program: {
            $ifNull: ['$program.title', 'Others'],
          },
          percentage: {
            $multiply: [
              { $cond: [{ $eq: ['$totalUsers', 0] }, 0, { $divide: ['$programs.count', '$totalUsers'] }] },
              100,
            ],
          },
          count: '$programs.count', // Add count of students for each program
        },
      },
      {
        $group: {
          _id: '$program',
          percentage: { $max: '$percentage' },
          count: { $sum: '$count' }, // Sum up the count of students for each program
        },
      },
      {
        $project: {
          program: '$_id',
          percentage: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    const allPrograms = await Program.find({})

    const result = allPrograms.map(program => {
      const matchingStat = elibraryStats.find(stat => stat.program === program.title)
      return {
        program: program.title,
        percentage: matchingStat ? matchingStat.percentage : 0,
        count: matchingStat ? matchingStat.count : 0, 
      }
    })

    const resultWithoutMinorSubjects = result.filter(entry => entry.program !== "Minor subjects")

    const totalCount = elibraryStats.reduce((acc, stat) => acc + stat.count, 0)

    res.status(200).json({
      elibraryStats: resultWithoutMinorSubjects,
      totalCount: totalCount
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router