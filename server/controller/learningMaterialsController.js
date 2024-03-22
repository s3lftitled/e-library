const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage')
const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')
const { app } = require('../config/firebase.config')

const storage = getStorage(app)

const uploadMaterial = async (req, res, learningMaterialRepository, courseRepository) => {
  const { courseId } = req.params
  const title = req.body.title
  const file = req.file

  try {
    // Validate title
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }

    // Find the course within the specified program
    const course = await courseRepository.findAndValidateCourse(courseId)

    // If course not found, return an error
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const storageRef = ref(storage, `learning-materials/${file.originalname}`)

    console.log(storageRef)
    
    // Upload file bytes to Firebase Storage
    const snapshot = await uploadBytesResumable(storageRef, file.buffer)

    console.log('file uploaded')

    console.log(snapshot.metadata.fullPath)

    // Create a new learning material using the uploaded file's metadata
    const learningMaterial = await learningMaterialRepository.createLearningMaterial({
      title: title,
      file: snapshot.metadata.fullPath
    })

    // Add the learning material to the course's list of materials
    await courseRepository.addLearningMaterialToCourse(courseId, learningMaterial._id)

    // Respond with the created learning material
    res.status(201).json(learningMaterial)
  } catch (error) {
    // Handle errors and respond with an error message
    console.error()
    console.error('Error uploading material:', error)
    res.status(500).json({ error: 'Failed to upload material. Please try again later.' })
  }
}

const getCourseLearningMaterial = async (req, res, courseRepository, learningMaterialRepository) => {
  const { courseID, userID } = req.params

  try {

    const cachedMaterials = await redisClient.get(`materials:${courseID}`)

    if (cachedMaterials) {
      try {
        const learningMaterials = JSON.parse(cachedMaterials)
        return res.status(200).json({ learningMaterials })
      } catch (err) {
        console.error('Error parsing cached materials:', err)
        res.status(500).json({ error: 'Error retrieving materials from Redis' })
        return
      }
    }

    const course = await courseRepository.findAndValidateCourse(courseID)

    if(!course) {
      return res.status(404).json({ error: 'Course subject is not found' })
    }

    console.log(course.learningMaterials)

    const learningMaterialsID = course.learningMaterials

    console.log(learningMaterialsID)

    if (!learningMaterialsID) {
      return res.status(404).json({ error: 'Course subject learning materials ID are not found'})
    }

    const learningMaterials = await learningMaterialRepository.findLearningMaterial(learningMaterialsID)

    console.log('materials', learningMaterials)
    if (!learningMaterials) {
      return res.status(404).json({ error: 'Course subject learning materials are not found' })
    }

    console.log(learningMaterials)

    await redisClient.SET(`materials:${userID}`, JSON.stringify(learningMaterials), {EX: DEFAULT_EXP})

    res.status(200).json({ learningMaterials })
  } catch (error) {
    console.error('Error retrieving course learning materials:', error)
    res.status(500).json({ error: 'Failed to retrieve course learning materials. Please try again later.' })
  }
} 

const getMaterial = async (req, res, learningMaterialRepository) => {
  try {
    const { materialID, userID } = req.params

    const cachedMaterials = await redisClient.get(`material:${userID}`)

    if (cachedMaterials) {
      try {
        const materialWithUrl = JSON.parse(cachedMaterials)
        return res.status(200).json({ material: materialWithUrl })
      } catch (err) {
        console.error('Error parsing cached materials:', err)
        res.status(500).json({ error: 'Error retrieving materials from Redis' })
        return
      }
    }

    if (!materialID) {
      return res.status(400).json({ error: 'Material ID is not found' })
    }

    // Find the learning material in MongoDB
    const material = await learningMaterialRepository.findAndValidateMaterial(materialID)

    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    // Get the download URL of the file from Firebase Storage
    const downloadUrl = await getDownloadURL(ref(storage, material.file))

    // Attach the download URL to the material object
    const materialWithUrl = { ...material.toObject(), downloadUrl }
    await redisClient.SET(`material:${userID}`, JSON.stringify(materialWithUrl), {EX: DEFAULT_EXP})
    res.status(200).json({ material: materialWithUrl })
  } catch (error) {
    console.error('Error retrieving material:', error)
    res.status(500).json({ error: 'Failed to retrieve material. Please try again later.' })
  }
}

module.exports = {
  uploadMaterial,
  getCourseLearningMaterial,
  getMaterial
}