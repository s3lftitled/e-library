const User = require('../models/user')

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
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  async findExistingUser(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw new Error(`Error finding existing user: ${error.message}`);
    }
  }
}


module.exports = UserRepository