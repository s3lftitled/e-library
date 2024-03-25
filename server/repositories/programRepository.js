const { Program } = require('../models/e-book')

class ProgramRepository {
  // Singleton pattern implementation
  constructor() {
    if (!ProgramRepository.instance) {
      ProgramRepository.instance = this
    }
    return this.instance
  }

  // Method to create a new program
  async createProgram(title, description) {
    try {
      const program = new Program({ title, description, courses: [] })
      return await program.save()
    } catch(error) {
      throw new Error(`Error creating program: ${error.message}`)
    }
  }

  // Method to find an existing program by title
  async findExistingProgramByTitle(title) {
    try { 
      return await Program.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })
    } catch(error) {
      throw new Error(`Error finding program by title: ${error.message}`)
    }
  }

  // Method to find a program by ID
  async findProgramByID(programID) {
    try { 
      return await Program.findById(programID)
    } catch(error) {
      throw new Error(`Error finding program by ID: ${error.message}`)
    }
  }

  // Method to fetch all programs
  async getAllPrograms() {
    try {
      return await Program.find({})
    } catch (error) {
      throw new Error(`Error fetching all programs: ${error.message}`)
    }
  }

  // Method to fetch programs by their IDs
  async getProgramByIds(programIds) {
    try {
      return await Program.find({ _id: { $in: programIds } })
    } catch (error) {
      throw new Error(`Error getting programs by IDs: ${error.message}`)
    }
  }

  // Method to find a program by ID with its associated courses
  async findProgramByIdWithCourses(programId) {
    try {
      return await Program.findById(programId).populate('courses');
    } catch (error) {
      throw new Error(`Error finding program by ID with courses: ${error.message}`)
    }
  }

  // Method to update a program's courses
  async updateProgramCourses(programID, courses) {
    try {
      return await Program.findByIdAndUpdate(programID, { courses }, { new: true })
    } catch (error) {
      throw new Error(`Error updating program courses: ${error.message}`)
    }
  }

  // Method to retrieve other programs except the user's program
  async getOtherPrograms(programId) {
    try {
      return await Program.find({ _id: { $ne: programId } })
    } catch (error) {
      throw new Error(`Error retrieving other programs: ${error.message}`)
    }
  }
}



module.exports = ProgramRepository
