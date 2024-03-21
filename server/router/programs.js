const ProgramRepository = require('../repositories/programRepository')
const DepartmentRepository = require('../repositories/departmentRepository')
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/verifyToken')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { 
  createProgram,
  getAllPrograms,
  getDepartmentPrograms
} = require('../controller/programController')

const programRepository = new ProgramRepository()
const departmentRepository = new DepartmentRepository()

// Create a program
router.post('/create-programs', (req, res) => createProgram(req, res, programRepository))

// GET all the programs
router.get('/get-programs', 
  verifyToken, 
  checkRole([ROLES.STAFF, ROLES.LIBRARIAN]),
  (req, res) => {
    getAllPrograms(req, res, programRepository)
  }
)

// Get programs of a department
router.get('/get-department-programs/:departmentID', 
  (req, res) => 
    getDepartmentPrograms(req, res, programRepository, departmentRepository)
)

module.exports = router