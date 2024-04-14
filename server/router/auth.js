// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes

// Importing repositories, middleware, and controllers
const UserRepository = require('../repositories/userRepository')
const LogRepository = require('../repositories/logRepository')
const DepartmentRepository = require('../repositories/departmentRepository')
const ProgramRepository = require('../repositories/programRepository')
const limiter = require('../middleware/rateLimiter')
const { 
  studentRegistration,
  staffRegistration,
  logIn, 
  verifyEmail, 
  logOut,
  changePassword
} = require('../controller/authController')

// Define UserRepository Instance
const userRepository = new UserRepository()
// Define LogRepository Instance
const logRepository = new LogRepository()
// Define DepartmentRepository Instance
const departmentRepository = new DepartmentRepository()
// Define ProgramRepository Instance
const programRepository = new ProgramRepository()

// Student Registration endpoint
router.post('/student-registration', limiter, (req, res) => {
  studentRegistration(req, res, userRepository, departmentRepository, programRepository)
  }    
)

// Staff Registration endpoint
router.post('/staff-registration', (req, res) => {
  staffRegistration(req, res, userRepository, departmentRepository, programRepository)
}
)

// Email Verification endpoint
router.post('/verify-email', (req, res) => {
    verifyEmail(req, res)
}
)

// User Log In endpoint
router.post('/login', (req, res) => {
  // Call your login function passing necessary parameters
  logIn(req, res, userRepository, logRepository)
})

router.put('/change-password/:userID', (req, res) => {
  changePassword(req, res, userRepository)
})

// User Log Out endpoint
router.delete('/logout/:userID', (req, res) => {
  logOut( req, res)
})


module.exports = router