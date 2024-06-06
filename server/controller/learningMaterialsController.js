const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage')
const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')
const { app } = require('../config/firebase.config')

const storage = getStorage(app)

/**
 * Upload a learning material to a course.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} courseRepository - The repository for course operations.
 * @param {Object} learningMaterialRepository - The repository for learning material operations.
 * @returns {Object} - JSON response indicating the success or failure of the operation.
 */
const uploadMaterial = async (req, res, courseRepository, learningMaterialRepository) => {
  const { courseId, userID } = req.params
  const title = req.body.title
  const author = req.body.author
  const file = req.file

  try {
    console.log(title, author, file)
    // Validate title
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }

     // Validate author
     if (!author|| typeof author !== 'string') {
      return res.status(400).json({ error: 'Author is required and must be a string' });
    }

    // Find the course within the specified program
    const course = await courseRepository.findAndValidateCourse(courseId)

    // If course not found, return an error
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    // Create a reference to the Firebase Storage location where the file will be stored.
    const storageRef = ref(storage, `learning-materials/${file.originalname}`)
    
    // Upload file bytes to Firebase Storage
    const snapshot = await uploadBytesResumable(storageRef, file.buffer)

    // Create a new learning material using the uploaded file's metadata
    const learningMaterial = await learningMaterialRepository.createLearningMaterial({
      title: title,
      author: author,
      file: snapshot.metadata.fullPath
    })

    // Add the learning material to the course's list of materials
    await courseRepository.addLearningMaterialToCourse(courseId, learningMaterial._id)

    await redisClient.del(`materials:${userID}:${courseId}`)

    // Respond with the created learning material
    res.status(201).json(learningMaterial)
  } catch (error) {
    // Handle errors and respond with an error message
    console.error()
    console.error('Error uploading material:', error)
    res.status(500).json({ error: 'Failed to upload material. Please try again later.' })
  }
}

/**
 * Get learning materials for a specific course.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} courseRepository - The repository for course operations.
 * @param {Object} learningMaterialRepository - The repository for learning material operations.
 * @returns {Object} - JSON response containing the learning materials for the course.
 */
const getCourseLearningMaterial = async (req, res, courseRepository, learningMaterialRepository) => {
  const { courseID, userID } = req.params

  try {
     // Check if the learning materials for the course are cached in Redis
    const cachedMaterials = await redisClient.get(`materials:${userID}:${courseID}`)

    // If cached materials exist, parse and return them
    if (cachedMaterials) {
      try {
        const learningMaterials = JSON.parse(cachedMaterials)
        return res.status(200).json({ learningMaterials })
      } catch (err) {
        // Handle parsing error if unable to parse cached materials
        console.error('Error parsing cached materials:', err)
        res.status(500).json({ error: 'Error retrieving materials from Redis' })
        return
      }
    }

     // Find and validate the course by its ID
    const course = await courseRepository.findAndValidateCourse(courseID)

    // If course not found, return error
    if(!course) {
      return res.status(404).json({ error: 'Course subject is not found' })
    }

    // Get the IDs of the learning materials associated with the course
    const learningMaterialsID = course.learningMaterials

    // If no learning materials are associated with the course, return error
    if (!learningMaterialsID) {
      return res.status(404).json({ error: 'Course subject learning materials ID are not found'})
    }

     // Find the learning materials based on their IDs
    const learningMaterials = await learningMaterialRepository.findLearningMaterial(learningMaterialsID)

    // If no learning materials are found, return error
    if (!learningMaterials) {
      return res.status(404).json({ error: 'Course subject learning materials are not found' })
    }

    // Cache the retrieved learning materials in Redis
    await redisClient.set(`materials:${userID}:${courseID}`, JSON.stringify(learningMaterials), "EX", DEFAULT_EXP)

    // Respond with the retrieved learning materials
    res.status(200).json({ learningMaterials })
  } catch (error) {
    // Handle any errors and respond with an error message
    console.error('Error retrieving course learning materials:', error)
    res.status(500).json({ error: 'Failed to retrieve course learning materials. Please try again later.' })
  }
} 

/**
 * Get details of a specific learning material.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} learningMaterialRepository - The repository for learning material operations.
 * @returns {Object} - JSON response containing the details of the learning material.
 */
const getMaterial = async (req, res, learningMaterialRepository) => {
  // Extract material ID and user ID from request parameters
  const { materialID, userID } = req.params

  try {
    // Check if the material details are cached in Redis
    const cachedMaterials = await redisClient.get(`material:${userID}:${materialID}`)

    // If cached materials exist, parse and return them
    if (cachedMaterials) {
      try {
        const materialWithUrl = JSON.parse(cachedMaterials)
        return res.status(200).json({ material: materialWithUrl })
      } catch (err) {
        // Handle parsing error if unable to parse cached materials
        console.error('Error parsing cached materials:', err)
        res.status(500).json({ error: 'Error retrieving materials from Redis' })
        return
      }
    }

    // Check if material ID is provided
    if (!materialID) {
      return res.status(400).json({ error: 'Material ID is not found' })
    }

    // Find the learning material in MongoDB
    const material = await learningMaterialRepository.findAndValidateMaterialById(materialID)

    // If material not found, return error
    if (!material) {
      return res.status(404).json({ error: 'Material not found' })
    }

    // Get the download URL of the file from Firebase Storage
    const downloadUrl = await getDownloadURL(ref(storage, material.file))

    // Attach the download URL to the material object
    const materialWithUrl = { ...material.toObject(), downloadUrl }
    
    // Cache the material details in Redis
    await redisClient.set(`material:${userID}:${materialID}`, JSON.stringify(materialWithUrl), "EX", DEFAULT_EXP)
    
    // Respond with the material details
    res.status(200).json({ material: materialWithUrl })
  } catch (error) {
    // Handle any errors and respond with an error message
    console.error('Error retrieving material:', error)
    res.status(500).json({ error: 'Failed to retrieve material. Please try again later.' })
  }
}

module.exports = {
  uploadMaterial,
  getCourseLearningMaterial,
  getMaterial
}