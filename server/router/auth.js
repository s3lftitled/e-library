// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes

// Importing repositories, middleware, and controllers
const UserRepository = require('../repositories/userRepository')
const LogRepository = require('../repositories/logRepository')
const limiter = require('../middleware/rateLimiter')
const { 
  studentRegistration,
  staffRegistration,
  logIn, 
  verifyEmail, 
  logOut 
} = require('../controller/authController')

// Define UserRepository Instance
const userRepository = new UserRepository()
// Define LogRepository Instance
const logRepository = new LogRepository()

// Student Registration endpoint
router.post('/student-registration', limiter, (req, res) =>
  studentRegistration(req, res, userRepository)
)

// Staff Registration endpoint
router.post('/staff-registration', (req, res) =>
  staffRegistration(req, res, userRepository)
)

// Email Verification endpoint
router.post('/verify-email', (req, res) =>
  verifyEmail(req, res, userRepository)
)

// User Log In endpoint
router.post('/login', (req, res) =>
  logIn(req, res, userRepository, logRepository)
)

// User Log Out endpoint
router.delete('/logout/:userID', logOut)

module.exports = router