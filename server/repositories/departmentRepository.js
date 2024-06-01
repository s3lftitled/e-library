const { Department } = require('../models/e-book')

class DepartmentRepository {
  constructor() {
    // Singleton pattern implementation
    if (!DepartmentRepository.instance) {
      DepartmentRepository.instance = this
    }
    return this.instance
  }

  // Method to create a new department
  async createDepartment(title) {
    try {
      const department = new Department({ title })
      return await department.save() 
    } catch (error) {
      throw new Error(`Error creating department ${error.message}`)
    }
  }

    // Method to find an existing department by title
  async findExistingDepartment(title) {
    try {
      return await Department.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })
    } catch (error) {
      throw new Error(`Error finding existing department ${error.message}`)
    }
  }

   // Method to find a department by ID
  async findDepartmentByID(departmentID) {
    try { 
      return await Department.findById(departmentID)
    } catch(error) {
      throw new Error(`Error finding program by title: ${error.message}`)
    }
  }

  // Method to find departments by IDs
  async findDepartmentsByIds(departmentIds) {
    try {
      return await Department.find({ _id: { $in: departmentIds } })
    } catch (error) {
      throw new Error(`Error finding departments by IDs: ${error.message}`)
    }
  }

   // Method to check if a program exists in a department
  async findExistingProgramInADept(programID) {
    try { 
      return await Department.findOne({ programs: programID })
    } catch(error) {
      throw new Error(`Error finding program: ${error.message}`)
    }
  }

   // Method to fetch all departments
  async getAllDepartments() {
    try {
      return await Department.find({})
    } catch (error) {
      throw new Error(`Error fetching departments: ${error.message}`)
    }
  }

  // Method to update a department's programs
  async updateDepartmentPrograms(departmentID, programs) {
    try {
      return await Department.findByIdAndUpdate(departmentID, { programs }, { new: true })
    } catch (error) {
      throw new Error(`Error updating department programs: ${error.message}`)
    }
  }
  
}

module.exports = DepartmentRepository