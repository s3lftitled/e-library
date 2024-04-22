// Import necessary modules and packages
const express = require('express')
const router = express.Router()

// Import repositories, middleware, and controllers
const ProgramRepository = require('../repositories/programRepository')
const DepartmentRepository = require('../repositories/departmentRepository')
const { verifyToken } = require('../middleware/verifyToken')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage')
const { app } = require('../config/firebase.config');
const { Program } = require('../models/e-book')
const { upload } = require('../middleware/multer')
const { 
  createProgram,
  getAllPrograms,
  getDepartmentPrograms,
  getProgramImageURL
} = require('../controller/programController')

const storage = getStorage(app)

// Create instances of repositories
const programRepository = new ProgramRepository()
const departmentRepository = new DepartmentRepository()

// Route for creating a program
router.post('/create-programs', verifyToken, checkRole([ROLES.LIBRARIAN]),
  (req, res) => 
   createProgram(req, res, programRepository)
  )

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

router.get('/get-image/:programID/:userID', 
  verifyToken,
  (req, res) => 
    getProgramImageURL(req, res, programRepository)
  )

// Export the router for use in other files
module.exports = router
