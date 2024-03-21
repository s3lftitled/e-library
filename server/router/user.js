// Import necessary modules and packages
const UserRepository = require('../repositories/userRepository')
const LogRepository = require('../repositories/logRepository')
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

// Define UserRepository Instance
const userRepository = new UserRepository()

//Define LogRepository Instance
const logRepository = new LogRepository()

// Student Registration endpoint
router.post('/student-registration', 
  limiter,  
  (req, res) => studentRegistration(req, res, userRepository)
)

// Staff Registration endpoint
router.post('/staff-registration', (req, res) => staffRegistration(req, res, userRepository))

// Email Verification endpoint
router.post('/verify-email',(req, res) => verifyEmail(req, res, userRepository) )

// User Log In endpoint
router.post('/login', limiter, (req, res) => logIn(req, res, userRepository, logRepository))

// Get User Data endpoint
router.get('/get-user/:userID',
  verifyToken, 
  (req, res) => 
    getUserData(
      req, 
      res, 
      userRepository, 
      logRepository
    )
)

// Upload User Profile Pic endpoint
router.post('/profile/upload-image/:userId', 
  verifyToken, 
  (req,res,) => uploadUserProfilePic(req,res, userRepository)
)

// Get programs + recommended programs endpoint
router.get('/:userID/programs', 
  verifyToken, 
  checkRole([ROLES.STUDENT]), 
  (req, res) => getPrograms(req, res, userRepository)
)


module.exports = router