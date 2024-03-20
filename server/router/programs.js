const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/verifyToken')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { 
  createProgram,
  getAllPrograms,
  getDepartmentPrograms
} = require('../controller/programController')

// Create a program
router.post('/create-programs', createProgram)

// GET all the programs
router.get('/get-programs', 
  verifyToken, 
  checkRole([ROLES.STAFF, ROLES.LIBRARIAN]),
  getAllPrograms 
)

// Get programs of a department
router.get('/get-department-programs/:departmentID', getDepartmentPrograms)

module.exports = router