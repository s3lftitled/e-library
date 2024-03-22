const User = require('../models/user')
const { Program } = require('../models/e-book')

class UserRepository {
  constructor() {
    if (!UserRepository.instance) {
      this.instance = this
    }
    return this.instance
  }

  async createUser(userData) {
    try {
      const newUser = new User(userData)
      return await newUser.save()
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`)
    }
  }

  async getUserById(userId) {
    try {
      return await User.findById(userId)
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`)
    }
  }

  async updateUser(userId, updatedData) {
    try {
      return await User.findByIdAndUpdate(userId, updatedData, { new: true })
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`)
    }
  }

  async deleteUser(userId) {
    try {
      return await User.findByIdAndDelete(userId)
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`)
    }
  }

  async findOneAndDelete(filter) {
    try {
      return await User.findOneAndDelete(filter)
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`)
    }
  }

  async findUserByEmail(email) {
    try {
      return await User.findOne({ email: email })
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`)
    }
  }

  async findExistingUser(email) {
    try {
      return await User.findOne({ email })
    } catch (error) {
      throw new Error(`Error finding existing user: ${error.message}`)
    }
  }

  async getTotalUserCount() {
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
      ])

      const allPrograms = await Program.find({})

      const result = allPrograms.map(program => {
        const matchingStat = elibraryStats.find(stat => stat.program === program.title)
        return {
          program: program.title,
          percentage: matchingStat ? matchingStat.percentage : 0,
          count: matchingStat ? matchingStat.count : 0, 
        }
      })

      const resultWithoutMinorSubjects = result.filter(entry => entry.program !== "Minor subjects");

      const totalCount = elibraryStats.reduce((acc, stat) => acc + stat.count, 0)

      return { elibraryStats: resultWithoutMinorSubjects, totalCount }
    } catch (error) {
      throw new Error(error.message)
    }
  }
}


module.exports = UserRepository