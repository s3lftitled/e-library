const express = require('express')
const router = express.Router()
const { upload } = require('../middleware/multer')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const {
  uploadMaterial,
  getCourseLearningMaterial,
  getMaterial
} = require('../controller/learningMaterialsController')

router.post('/courses/:courseId', upload, checkRole([ROLES.LIBRARIAN]), uploadMaterial)

router.get('/courses/:courseID', getCourseLearningMaterial)

router.get('/get-material/:materialID', getMaterial)

module.exports = router
