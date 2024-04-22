// Import necessary modules and packages
const express = require('express')
const router = express.Router()

// Import repositories, middleware, and controllers
const DepartmentRepository = require('../repositories/departmentRepository')
const ProgramRepository = require('../repositories/programRepository')
const { verifyToken } = require('../middleware/verifyToken')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const {
  createDepartment,
  addProgramToDept,
  getAllDepartments
} = require('../controller/departmentController')

// Create instances of repositories
const departmentRepository = new DepartmentRepository()
const programRepository = new ProgramRepository()

// Route for creating a department
router.post('/create-department', 
  verifyToken, // Middleware to verify token
  checkRole([ROLES.LIBRARIAN]), // Middleware to check role
  (req, res) => createDepartment(req, res, departmentRepository)
)

// Route for adding a program to a department
router.post('/:departmentID/programs/:programID', 
  verifyToken, // Middleware to verify token
  checkRole([ROLES.LIBRARIAN]), // Middleware to check role
  (req, res) => addProgramToDept(req, res, departmentRepository, programRepository)
)

// Route for getting all departments
router.get('/get-departments',
  (req, res) => 
    getAllDepartments(req, res, departmentRepository)
  )

// Export the router for use in other files
module.exports = router
