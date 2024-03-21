const { Department } = require('../models/e-book')

class DepartmentRepository {
  constructor() {
    if (!DepartmentRepository.instance) {
      this.instance = this;
    }
    return this.instance;
  }

  async createDepartment() {
    try {
      const department = new Department({ title })
      return await department.save() 
    } catch (error) {
      throw new Error(`Error creating department ${error.message}`)
    }
  }

  async findExistingDepartment(title) {
    try {
      return await Department.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })
    } catch (error) {
      throw new Error(`Error finding existing department ${error.message}`)
    }
  }

  async findDepartmentByID(departmentID) {
    try { 
      return await Department.findById(departmentID)
    } catch(error) {
      throw new Error(`Error finding program by title: ${error.message}`)
    }
  }

  async findExistingProgramInADept(programID) {
    try { 
      return await Department.findOne({ programs: programID })
    } catch(error) {
      throw new Error(`Error finding program: ${error.message}`)
    }
  }

  async getAllDepartments() {
    try {
      return await Department.find({})
    } catch (error) {
      throw new Error(`Error fetching departments: ${error.message}`)
    }
  }

  async updateDepartmentPrograms(departmentID, programs) {
    try {
      return await Department.findByIdAndUpdate(departmentID, { programs }, { new: true });
    } catch (error) {
      throw new Error(`Error updating department programs: ${error.message}`);
    }
  }
  
}

module.exports = DepartmentRepository