const DepartmentRepository = require('../repositories/departmentRepository')
const ProgramRepository = require('../repositories/programRepository')
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/verifyToken')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const {
  createDepartment,
  addProgramToDept,
  getAllDepartments
} = require('../controller/departmentController')

const departmentRepository = new DepartmentRepository()
const programRepository = new ProgramRepository()

// Create a department
router.post('/create-department', 
  verifyToken,
  checkRole([ROLES.LIBRARIAN]), 
  (req, res) => 
    createDepartment(req,res, departmentRepository) 
)

router.post('/:departmentID/programs/:programID', 
  verifyToken, 
  checkRole([ROLES.LIBRARIAN]), 
  (req, res) => {
    addProgramToDept(req, res, departmentRepository, programRepository)
  } )

// GET all the department
router.get('/get-departments', (req, res) => getAllDepartments(req, res, departmentRepository))

module.exports = router
