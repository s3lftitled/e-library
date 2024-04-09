// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes

// Importing repositories, middleware, and controllers
const UserRepository = require('../repositories/userRepository')
const ProgramRepository = require('../repositories/programRepository')
const LearningMaterialRepository = require('../repositories/learningMaterialsRepository')
const DepartmentRepository = require('../repositories/departmentRepository')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const { verifyToken } = require('../middleware/verifyToken')

const { 
  getUserData,
  uploadUserProfilePic,
  getPrograms,
  deleteUserAccount,
  addToBookMark,
  getUserBookShelf,
  deleteFromBookshelf
} = require('../controller/userController')

// Define UserRepository Instance
const userRepository = new UserRepository()
// Define ProgramRepository Instance
const programRepository = new ProgramRepository()
// Define LearningMaterialRepository Instance
const learningMaterialRepository = new LearningMaterialRepository()
// Define DepartmentRepository Instance
const departmentRepository = new DepartmentRepository()

// Get User Data endpoint
router.get('/get-user/:userID', verifyToken, (req, res) =>
  getUserData(req, res, userRepository, departmentRepository, programRepository )
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

router.delete('/:userID/delete-from-bookshelf/:materialID', verifyToken, (req, res) => {
  deleteFromBookshelf(req, res, userRepository, learningMaterialRepository)
})

module.exports = router // Exporting the router for use in other files
