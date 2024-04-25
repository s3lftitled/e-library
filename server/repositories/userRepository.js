const User = require('../models/user')
const { Program } = require('../models/e-book')
const { isValidObjectId } = require('mongoose')

class UserRepository {
  constructor() {
    // Singleton pattern implementation
    if (!UserRepository.instance) {
      UserRepository.instance = this
    }
    return this.instance
  }

  // Method to create a new user
  async createUser(userData) {
    try {
      const newUser = new User(userData)
      return await newUser.save()
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`)
    }
  }

  // Method to get a user by ID
  async getUserById(userId) {
    try {
      if (!isValidObjectId(userId)) {
        throw new Error('Invalid user ID')
      }
      return await User.findById(userId)
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`)
    }
  }

  // Method to update a user
  async updateUser(userId, updatedData) {
    try {
      return await User.findByIdAndUpdate(userId, updatedData, { new: true })
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`)
    }
  }

  // Method to delete a user
  async deleteUser(userId) {
    try {
      return await User.findByIdAndDelete(userId)
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`)
    }
  }

  // Method to find and delete a user
  async findOneAndDelete(filter) {
    try {
      return await User.findOneAndDelete(filter)
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`)
    }
  }

  // Method to find a user by email
  async findUserByEmail(email) {
    try {
      return await User.findOne({ email: email })
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`)
    }
  }

  // Method to find an existing user
  async findExistingUser(email) {
    try {
      return await User.findOne({ email })
    } catch (error) {
      throw new Error(`Error finding existing user: ${error.message}`)
    }
  }

  async findUserByResetToken(resetToken) {
    try {
      return await User.findOne({ resetToken: resetToken })
    } catch (error) {
      throw new Error(`Error finding user by reset token: ${error.message}`)
    }
  }

  async addMaterialToBookShelf({ user, materialID }) {
    try {
      if (!user || !materialID) {
        throw new Error('Invalid user or material ID')
      }

      if (user.bookshelf.includes(materialID)) {
        throw new Error('Material is already on your bookshelf')
      }
  
      // Push the materialID to the user's bookshelf array
      user.bookshelf.push(materialID)
  
      // Save the updated user object
      await user.save()
  
      // Return the updated user object
      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteMaterialFromBookshelf({userID, materialID}) {
    try {
      if (!userID || !materialID) {
        throw new Error('Invalid userID or materialID')
      }

      const updatedUser = await User.findByIdAndUpdate(
        userID,
        { $pull: { bookshelf: materialID } },
        { new: true }
      )

      if (!updatedUser) {
        throw new Error('User not found')
      }
  
      return updatedUser
    } catch (error) {
      throw new Error(error.message)
    }
  }

  // Method to get total user count and program-wise distribution
  async getTotalUserCount() {
    try {
      // Aggregate query to get user statistics
      const elibraryStats = await User.aggregate([
        // Group by programID and count users
        {
          $group: {
            _id: '$programID',
            count: { $sum: 1 },
          },
        },
        // Group again to calculate total users and program-wise distribution
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
        // Unwind programs array
        {
          $unwind: { path: '$programs', preserveNullAndEmptyArrays: true },
        },
        // Lookup program information
        {
          $lookup: {
            from: 'programs',
            localField: 'programs.programID',
            foreignField: '_id',
            as: 'program',
          },
        },
        // Unwind program array
        {
          $unwind: { path: '$program', preserveNullAndEmptyArrays: true },
        },
        // Project data
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
        // Group by program to get final statistics
        {
          $group: {
            _id: '$program',
            percentage: { $max: '$percentage' },
            count: { $sum: '$count' }, // Sum up the count of students for each program
          },
        },
        // Project final output
        {
          $project: {
            program: '$_id',
            percentage: 1,
            count: 1,
            _id: 0,
          },
        },
      ])

      // Get all programs
      const allPrograms = await Program.find({})

      // Map statistics to program data
      const result = allPrograms.map(program => {
        const matchingStat = elibraryStats.find(stat => stat.program === program.title)
        return {
          program: program.title,
          percentage: matchingStat ? matchingStat.percentage : 0,
          count: matchingStat ? matchingStat.count : 0, 
        }
      })

      // Filter out minor subjects from the result
      const resultWithoutMinorSubjects = result.filter(entry => entry.program !== "Minor subjects")

      // Calculate total user count
      const totalCount = elibraryStats.reduce((acc, stat) => acc + stat.count, 0)

      // Return final statistics
      return { elibraryStats: resultWithoutMinorSubjects, totalCount }
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.exports = UserRepository

