const express = require('express')
const router = express.Router()
const { LearningMaterial, Course } = require('../models/e-book')
const multer = require('multer')
const fs = require('fs').promises

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname)
  },
})

const upload = multer({ storage: storage })

router.post('/courses/:courseId', upload.single('file'), async (req, res) => {
  const { courseId } = req.params
  const title = req.body.title
  const fileName = req.file.filename

  try {
    // Find the course within the specified program
    const course = await Course.findOne({ _id: courseId })

    // If course not found, return an error
    if (!course) {
      return res.status(404).json({ error: 'Course not found in the specified program' })
    }

    // Create a new learning material using the binary file data
    const learningMaterial = await LearningMaterial.create({
      file: fileName,
      title: title
    })

    // Add the learning material to the course's list of materials
    course.learningMaterials.push(learningMaterial._id)
    await course.save();

    // Respond with the created learning material
    res.status(201).json(learningMaterial)
  } catch (error) {
    // Handle errors and respond with an error message
    res.status(500).json({ error: error.message })
  }
})

router.get('/courses/:courseID', async (req, res) => {
  const { courseID } = req.params

  try {
    const course = await Course.findById({ _id: courseID})

    if(!course) {
      return res.status(404).json({ msg: 'Course subject is not found' })
    }

    const learningMaterialsID = course.learningMaterials

    if (!learningMaterialsID) {
      return res.status(404).json({ msg: 'Course subject learning materials ID are not found'})
    }

    const learningMaterials = await LearningMaterial.find({ _id: { $in: learningMaterialsID } })

    if (!learningMaterials) {
      return res.status(404).json({ msg: 'Course subject learning materials are not found' })
    }

    console.log(learningMaterials)

    res.status(200).json({ learningMaterials })
  } catch (err) {
    res.status(500).json({ msg: 'Internal server error'})
  }
})

router.get('/get-material/:materialID', async (req, res) => {
  try {
    const { materialID } = req.params

    if(!materialID) {
      return res.status(400).json({ msg: 'Material ID is not found'})
    }

    const material = await LearningMaterial.findById(materialID)

    if(!material) {
      return res.status(400).json({ msg: 'Material is not found'})
    }

    res.status(200).json({ material })
  
  } catch (err) {
    res.status(500).json({ msg: 'Internal Server Error'})
  }
})

module.exports = router
