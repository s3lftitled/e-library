// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const  { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { verifyToken } = require('../middleware/verifyToken')
const limiter = require('../middleware/rateLimiter')
const { logIn, verifyEmail } = require('../controller/authController')
const { 
  studentRegistration,
  staffRegistration,
  getUserData,
  uploadUserProfilePic,
  getPrograms
} = require('../controller/userController')

// User registration endpoint
router.post('/student-registration', limiter, studentRegistration)

// Common registration logic for users without departments
router.post('/staff-registration', staffRegistration)

// Email Verification endpoint
router.post('/verify-email', verifyEmail)

// User Log In endpoint
router.post('/login', limiter, logIn)

// Get User Data 
router.get('/get-user/:userID', verifyToken, getUserData )

// Upload User Profile Pic
router.post('/profile/upload-image/:userId', 
  verifyToken, 
  uploadUserProfilePic
)

// Get programs + recommended programs
router.get('/:userID/programs', 
  verifyToken, 
  checkRole([ROLES.STUDENT]), 
  getPrograms
)


module.exports = router