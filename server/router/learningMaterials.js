// Import necessary modules and packages
const express = require('express')
const router = express.Router()

// Import repositories, middleware, and controllers
const CourseRepository = require('../repositories/courseRepository')
const LearningMaterialRepository = require('../repositories/learningMaterialsRepository')
const { upload } = require('../middleware/multer')
const { verifyToken } = require('../middleware/verifyToken')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const {
  uploadMaterial,
  getCourseLearningMaterial,
  getMaterial
} = require('../controller/learningMaterialsController')

// Create instances of repositories
const courseRepository = new CourseRepository()
const learningMaterialRepository = new LearningMaterialRepository()

// Route for uploading material to a course
router.post('/courses/:courseId', upload, 
  (req, res) => uploadMaterial(req, res, courseRepository, learningMaterialRepository)
)

// Route for getting learning material for a course
router.get('/courses/:courseID/:userID', verifyToken,
  (req, res) => getCourseLearningMaterial(req, res, courseRepository, learningMaterialRepository)
)

// Route for getting specific material
router.get('/get-material/:materialID/:userID', 
  (req,res) => getMaterial(req, res, learningMaterialRepository)
)

// Export the router for use in other files
module.exports = router
