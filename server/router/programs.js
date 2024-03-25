// Import necessary modules and packages
const express = require('express')
const router = express.Router()

// Import repositories, middleware, and controllers
const ProgramRepository = require('../repositories/programRepository')
const DepartmentRepository = require('../repositories/departmentRepository')
const { verifyToken } = require('../middleware/verifyToken')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { 
  createProgram,
  getAllPrograms,
  getDepartmentPrograms
} = require('../controller/programController')

// Create instances of repositories
const programRepository = new ProgramRepository()
const departmentRepository = new DepartmentRepository()

// Route for creating a program
router.post('/create-programs', (req, res) => createProgram(req, res, programRepository))

// Route for getting all programs
router.get('/get-programs', 
  verifyToken, // Middleware to verify token
  checkRole([ROLES.STAFF, ROLES.LIBRARIAN]), // Middleware to check role
  (req, res) => {
    getAllPrograms(req, res, programRepository)
  }
)

// Route for getting programs of a department
router.get('/get-department-programs/:departmentID', 
  (req, res) => 
    getDepartmentPrograms(req, res, programRepository, departmentRepository)
)

// Export the router for use in other files
module.exports = router
