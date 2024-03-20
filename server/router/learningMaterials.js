const express = require('express')
const router = express.Router()
const { LearningMaterial, Course } = require('../models/e-book')
const { app } = require('../config/firebase.config')
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage')
const { upload } = require('../middleware/multer')

const storage = getStorage(app)

router.post('/courses/:courseId', upload , async (req, res) => {
  const { courseId } = req.params
  const title = req.body.title
  const file = req.file

  try {

    console.log(file)
    // Find the course within the specified program
    const course = await Course.findOne({ _id: courseId })

    // If course not found, return an error
    if (!course) {
      return res.status(404).json({ error: 'Course not found in the specified program' })
    }

    const storageRef = ref(storage, `learning-materials/${file.originalname}`)

    console.log(storageRef)
    
    // Upload file bytes to Firebase Storage
    const snapshot = await uploadBytesResumable(storageRef, file.buffer)

    console.log('file uploaded')

    console.log(snapshot.metadata.fullPath)

    // Create a new learning material using the uploaded file's metadata
    const learningMaterial = await LearningMaterial.create({
      title: title,
      file: snapshot.metadata.fullPath
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

    if (!materialID) {
      return res.status(400).json({ msg: 'Material ID is not found' })
    }

    // Find the learning material in MongoDB
    const material = await LearningMaterial.findById(materialID)

    if (!material) {
      return res.status(404).json({ msg: 'Material not found' })
    }

    // Get the download URL of the file from Firebase Storage
    const downloadUrl = await getDownloadURL(ref(storage, material.file))

    // Attach the download URL to the material object
    const materialWithUrl = { ...material.toObject(), downloadUrl }

    res.status(200).json({ material: materialWithUrl })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
})

module.exports = router
