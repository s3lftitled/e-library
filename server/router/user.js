// Import necessary modules and packages
const UserRepository = require('../repositories/userRepository')
const LogRepository = require('../repositories/logRepository')
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const  { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { verifyToken } = require('../middleware/verifyToken')
const limiter = require('../middleware/rateLimiter')
const { logIn, verifyEmail, logOut } = require('../controller/authController')
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

// User Log Out endpoint
router.delete('/logout/:userID', logOut)

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

router.delete('/delete-user/:userId', verifyToken, checkRole([ROLES.STAFF]), async (req, res) => {
  try {
    const { userId } = req.params

    // Ensure that the userId is provided
    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required for deletion.' })
    }

    // Check if the user to be deleted exists
    const userToDelete = await User.findById(userId)
    if (!userToDelete) {
      return res.status(404).json({ msg: 'User not found' })
    }

    // Perform the deletion
    await User.findByIdAndDelete(userId)

    res.status(200).json({ msg: 'User deleted successfully.' })
  } catch (error) {
    // Handle errors
    res.status(500).json({ msg: error.message })
  }
})

module.exports = router