const { Program } = require('../models/e-book')

class ProgramRepository {
  constructor() {
    if (!ProgramRepository.instance) {
      this.instance = this;
    }
    return this.instance;
  }

  async createProgram(title, description) {
    try {
      const program = new Program({ title, description, courses: [] })
      return await program.save()
    } catch(error) {
      throw new Error(`Error creating program: ${error.message}`)
    }
  }

  async findExistingProgramByTitle(title) {
    try { 
      return await Program.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })
    } catch(error) {
      throw new Error(`Error finding program by title: ${error.message}`)
    }
  }

  async findProgramByID(programID) {
    try { 
      return await Program.findById(programID)
    } catch(error) {
      throw new Error(`Error finding program by title: ${error.message}`)
    }
  }

  async getAllPrograms() {
    try {
      return await Program.find({})
    } catch (error) {
      throw new Error(`Error fetching all programs: ${error.message}`)
    }
  }

  async getProgramByIds(programIds) {
    try {
      return await Program.find({ _id: { $in: programIds } })
    } catch (error) {
      throw new Error(`Error getting programs by IDs: ${error.message}`)
    }
  }

  async findProgramByIdWithCourses(programId) {
    try {
      return await Program.findById(programId).populate('courses');
    } catch (error) {
      throw new Error(`Error finding program by ID with courses: ${error.message}`);
    }
  }

  async updateProgramCourses(programID, courses) {
    try {
      return await Program.findByIdAndUpdate(programID, { courses }, { new: true });
    } catch (error) {
      throw new Error(`Error updating department programs: ${error.message}`);
    }
  }
}

module.exports = ProgramRepository