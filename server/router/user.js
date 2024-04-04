// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes

// Importing repositories, middleware, and controllers
const UserRepository = require('../repositories/userRepository')
const LogRepository = require('../repositories/logRepository')
const ProgramRepository = require('../repositories/programRepository')
const LearningMaterialRepository = require('../repositories/learningMaterialsRepository')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { verifyToken } = require('../middleware/verifyToken')
const limiter = require('../middleware/rateLimiter')
const { 
  logIn, 
  verifyEmail, 
  logOut 
} = require('../controller/authController')
const { 
  studentRegistration,
  staffRegistration,
  getUserData,
  uploadUserProfilePic,
  getPrograms,
  deleteUserAccount,
  addToBookMark,
  getUserBookShelf
} = require('../controller/userController')

// Define UserRepository Instance
const userRepository = new UserRepository()
// Define LogRepository Instance
const logRepository = new LogRepository()
// Define ProgramRepository Instance
const programRepository = new ProgramRepository()
// Define LearningMaterialRepository Instance
const learningMaterialRepository = new LearningMaterialRepository()

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

// Get User Data endpoint
router.get('/get-user/:userID', verifyToken, (req, res) =>
  getUserData(req, res, userRepository, logRepository)
)

// Upload User Profile Pic endpoint
router.post('/profile/upload-image/:userId', verifyToken, (req, res) =>
  uploadUserProfilePic(req, res, userRepository)
)

// Get programs + recommended programs endpoint
router.get('/:userID/programs', verifyToken, checkRole([ROLES.STUDENT]), (req, res) =>
  getPrograms(req, res, userRepository, programRepository)
)

// Delete User Account endpoint
router.delete('/delete-user/:userId', verifyToken, checkRole([ROLES.STAFF]), (req, res) =>
  deleteUserAccount(req, res, userRepository)
)

router.post('/:userID/add-to-bookmark/:materialID', verifyToken, (req, res) => 
  addToBookMark(req, res, userRepository, learningMaterialRepository)
)

router.get('/:userID/book-shelf', verifyToken, (req, res) => 
  getUserBookShelf(req, res, userRepository, learningMaterialRepository)
)

module.exports = router // Exporting the router for use in other files
