const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/verifyToken')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const {
  createDepartment,
  addProgramToDept,
  getAllDepartments
} = require('../controller/departmentController')

// Create a department
router.post('/create-department', verifyToken, checkRole([ROLES.LIBRARIAN]), createDepartment )

router.post('/:departmentID/programs/:programID', verifyToken, checkRole([ROLES.LIBRARIAN]), addProgramToDept )

// GET all the department
router.get('/get-departments', getAllDepartments)

module.exports = router
