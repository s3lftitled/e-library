// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes

// Importing repositories, middleware, and controllers
const UserRepository = require('../repositories/userRepository')
const LogRepository = require('../repositories/logRepository')
const DepartmentRepository = require('../repositories/departmentRepository')
const ProgramRepository = require('../repositories/programRepository')
const limiter = require('../middleware/rateLimiter')
const { requestHandler, errorLogger } = require('../logger/loggers')
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
  try {
    studentRegistration(req, res, userRepository, departmentRepository, programRepository)

    requestHandler('/student-registration')
  } catch (error) {
    errorLogger.error(`Error in login route: ${error.message}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}
)

// Staff Registration endpoint
router.post('/staff-registration', async (req, res) => {
try {
  staffRegistration(req, res, userRepository, departmentRepository, programRepository)

  requestHandler('/staff-registration')
} catch (error) {
  errorLogger.error(`Error in login route: ${error.message}`)
  res.status(500).json({ error: 'Internal server error' })
}
}
)

// Email Verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    verifyEmail(req, res, userRepository)

    requestHandler('/verify-email')
  } catch (error) {
    errorLogger.error(`Error in login route: ${error.message}`)
    res.status(500).json({ error: 'Internal server error' })
  }
}
  
)

// User Log In endpoint
router.post('/login', async (req, res) => {
  try {
    // Call your login function passing necessary parameters
    logIn(req, res, userRepository, logRepository)

    // If login is successful, you can call the requestHandler function
    requestHandler('/login')
  } catch (error) {
    // Handle any errors that might occur during login
    errorLogger.error(`Error in login route: ${error.message}`)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/change-password/:userID', (req, res) => {
try {
  changePassword(req, res, userRepository)

  requestHandler('/change-password')
} catch (error) {
  errorLogger.error(`Error in logout route: ${error.message}`)
  res.status(500).json({ error: 'Internal server error' })
}
})

// User Log Out endpoint
router.delete('/logout/:userID', async (req, res) => {
try {
  // Call your login function passing necessary parameters
  logOut( req, res)

  // If login is successful, you can call the requestHandler function
  requestHandler('/logout')
} catch (error) {
  // Handle any errors that might occur during login
  errorLogger.error(`Error in logout route: ${error.message}`)
  res.status(500).json({ error: 'Internal server error' })
}
})


module.exports = router