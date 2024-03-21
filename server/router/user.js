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
const UserRepository = require('../repositories/userRepository')

// Define UserRepository Instance
const userRepository = new UserRepository()

router.post('/student-registration', limiter,  (req, res) => studentRegistration(req, res, userRepository))

router.post('/staff-registration', (req, res) => staffRegistration(req, res, userRepository))

// Email Verification endpoint
router.post('/verify-email', verifyEmail)

// User Log In endpoint
router.post('/login', limiter, logIn)

// Get User Data 
router.get('/get-user/:userID', verifyToken, (req, res) => getUserData(req, res, userRepository) )

// Upload User Profile Pic
router.post('/profile/upload-image/:userId', 
  verifyToken, 
  (req,res,) => uploadUserProfilePic(req,res, userRepository)
)

// Get programs + recommended programs
router.get('/:userID/programs', 
  verifyToken, 
  checkRole([ROLES.STUDENT]), 
  (req, res) => getPrograms(req, res, userRepository)
)


module.exports = router