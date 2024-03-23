const CourseRepository = require('../repositories/courseRepository')
const LearningMaterialRepository = require('../repositories/learningMaterialsRepository')
const express = require('express')
const router = express.Router()
const { upload } = require('../middleware/multer')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const {
  uploadMaterial,
  getCourseLearningMaterial,
  getMaterial
} = require('../controller/learningMaterialsController')

const courseRepository = new CourseRepository()
const learningMaterialRepository = new LearningMaterialRepository()

router.post('/courses/:courseId', upload, 
  (req, res) => uploadMaterial(req, res, courseRepository, learningMaterialRepository)
)

router.get('/courses/:courseID/:userID', 
  (req, res) => getCourseLearningMaterial(req, res, courseRepository, learningMaterialRepository)
)

router.get('/get-material/:materialID/:userID', 
  (req,res) => getMaterial(req, res, learningMaterialRepository)
)

module.exports = router
