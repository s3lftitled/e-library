const User = require('../models/user')
const { Department, Program } = require('../models/e-book')
const express = require('express') 
const router = express.Router()
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { verifyToken } = require('../middleware/verifyToken')

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

// Delete user endpoint (accessible only by staff)
router.delete('/delete-user/:userId', verifyToken, checkRole([ROLES.STAFF]), async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure that the userId is provided
    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required for deletion.' });
    }

    // Check if the user to be deleted exists
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Perform the deletion
    await User.findByIdAndDelete(userId);

    res.status(200).json({ msg: 'User deleted successfully.' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ msg: error.message });
  }
})

module.exports = router