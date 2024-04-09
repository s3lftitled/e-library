const sharp = require('sharp')
require('dotenv').config() // Loading environment variables
const {  ROLES } = require('../middleware/auth-middleWare')
const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')

/**
 * Retrieves user data including email, username, department, program, profile picture, and role.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @returns {void}
 */
const getUserData = async (req, res, userRepository, departmentRepository, programRepository) => {
  // Extracts user id from request paremeters
  const { userID } = req.params
  
  try {
 
    // Ensure userID is provided
    if (!userID) {
      return res.status(404).json({ error: 'userID is not found' })
    }

    // Check if user data is cached
    const cachedUser = await redisClient.get(`user-details:${userID}`)

    // If cached user exist, parse and return them
    if (cachedUser) {
      try {
        const currentUser = JSON.parse(cachedUser)
        res.status(200).json({ currentUser })
        return
      } catch (error) {
        // Handle parsing error if unable to parse cached materials
        console.error('Error parsing cached programs:', error)
        res.status(500).json({ error: 'Error retrieving programs from Redis' })
        return
      }
    }

    // Retrieve user data from the database
    const user = await userRepository.getUserById(userID)

    // Check if user is not found and return an error if true
    if (!user) {
      return res.status(404).json({ error: 'User with that ID is not found' })
    }

    // Initialize variables for user department and program
    let userDepartment, userProgram

    
    // For non-staff and non-librarian users, find department and program details
    if (user.role !== ROLES.STAFF && user.role !== ROLES.LIBRARIAN) {
      // Find the departments and programs for non-staff and non-librarian users
      userDepartments = await departmentRepository.findDepartmentsByIds(user.departmentID);
      userPrograms = await programRepository.findProgramsByIds(user.programID);

      // Check if departments or programs are not found
      if (!userDepartments.length || !userPrograms.length) {
        return res.status(404).json({ error: 'User departments or programs are not found' });
      }
    }

     // Prepare current user object
    const currentUser = ({
      email: user.email,
      username: user.username,
      departmentName: userDepartment ? userDepartment.title : 'N/A',
      programName: userProgram ? userProgram.title : 'N/A',
      profilePic: user.profilePic,
      role: user.role,
    })

     // Cache the user data
    await redisClient.set(`user-details:${userID}`, JSON.stringify(currentUser), "EX", DEFAULT_EXP)
    // Respond with the current user data
    res.status(200).json({ currentUser })
  } catch (error) {
    // Handle errors
    console.error('Get user data error:', error.message)
    res.status(500).json({ error: 'Failed to retrieve user data. Please try again later.' })
  }
}

/**
 * Uploads a user's profile picture.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @returns {void}
 */
const uploadUserProfilePic =  async (req, res, userRepository) => {
  // Extracts necessary details from request body and parameters
  const { base64Image } = req.body
  const userId = req.params.userId

  try {
    // Allowed image formats
    const allowedFormats = ['jpeg', 'jpg', 'png']
     // Detect the image format from base64 string
    const detectedFormat = base64Image.match(/^data:image\/(\w+);base64,/)
    const imageFormat = detectedFormat ? detectedFormat[1] : null

      // Check if image format is supported
    if (!imageFormat || !allowedFormats.includes(imageFormat.toLowerCase())) {
      return res.status(400).json({ error: 'Unsupported image format. Please upload a JPEG, JPG, or PNG image.' })
    }

     // Convert base64 image to buffer
    const imageBuffer = Buffer.from(base64Image.split(',')[1], 'base64')

    // Resize the image
    const resizedImage = await sharp(imageBuffer)
      .resize({
        fit: 'cover',
        width: 200,
        height: 200,
        withoutEnlargement: true,
      })
      .toFormat(imageFormat)
      .toBuffer()

    // Convert resized image buffer to base64
    const resizedImageBase64 = `data:image/${imageFormat};base64,${resizedImage.toString('base64')}`

    // Update user profile picture in the database
    await userRepository.updateUser(userId, { profilePic: resizedImageBase64 })

    // Delete cached user data because details are changed
    await redisClient.del(`user-details:${userId}`)

     // Respond with success message and resized image
    res.status(200).json({ msg: 'Profile picture uploaded successfully', resizedImage: resizedImageBase64 })
  } catch (error) {
    // Handle errors
    console.error('Upload profile picture error:', error.message)
    res.status(500).json({ error: 'Failed to upload profile picture. Please try again later.' })
  }
}

/**
 * Retrieves programs associated with a user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @returns {void}
 */
const getPrograms = async (req, res, userRepository, programRepository) => {
  // Extracts user id from request parameteres
  const { userID } = req.params

  try {
    // Ensure userID is provided
    if (!userID) {
      return res.status(404).json({ error: 'User ID is not found' })
    }

     // Check if programs are cached
     const cachedPrograms = await redisClient.get(`programs:${userID}`)

     // If cached progams exist, parse and return them
     if (cachedPrograms) {
       try {
         const response = JSON.parse(cachedPrograms)
         res.status(200).json({ response })
         return
       } catch (err) {
         // Handle parsing error if unable to parse cached materials
         console.error('Error parsing cached programs:', err)
         res.status(500).json({ msg: 'Error retrieving programs from Redis' })
         return
       }
     }
 
    // Retrieve user data from the database thru the userRepository instance
    const user = await userRepository.getUserById(userID)

    // Check is user is found, if not return an error
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }


    // Retrieve the user's program from the database thru programRepository instance
    const userProgram = await programRepository.findProgramByID(user.programID)

    // Check is user program is found, if not return an error
    if (!userProgram) {
      return res.status(404).json({ error: 'User program is not found' })
    }

    // Retrieve other programs except the user's program
    const restOfPrograms = await programRepository.getOtherPrograms(userProgram)

    // Assign userProgram to recommendedPrograms
    const recommendedPrograms = userProgram

    restOfPrograms.sort((a, b) => a.title.localeCompare(b.title))

    // Construct response object with recommended programs and the rest of the programs
    const response = {
      msg: 'Recommended Programs and Rest of the Programs:',
      recommendedPrograms,
      restOfPrograms,
    }

     // Cache programs in Redis
    await redisClient.set(`programs:${userID}`, JSON.stringify(response), "EX", DEFAULT_EXP)
    // Respond with the response
    res.status(200).json({ response })
  } catch (error) {
    // Handle errors
    console.error('Get programs error:', error.message)
    res.status(500).json({ error: 'Failed to retrieve programs. Please try again later.' })
  }
}

/**
 * Deletes a user account.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @returns {void}
 */
const deleteUserAccount = async (req, res, userRepository) => {
  // Extracts user id from request parameteres
  const { userId } = req.params

  try {
    // Ensure that the userId is provided
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required for deletion.' })
    }

    // Check if the user to be deleted exists
    const userToDelete = await userRepository.getUserById(userId)

    // Check is the user to delete is found, if not returns an error
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Perform the deletion
    await userRepository.deleteUser(userId)

    // Respond with success message
    res.status(200).json({ msg: 'User deleted successfully.' })
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message })
  }
}

const addToBookMark = async(req, res, userRepository, learningMaterialRepository) => {
  const { userID, materialID } = req.params

  try {
    if (!userID || !materialID) {
      return res.status(400).json({ error: "Invalid or missing parameters" })
    }

    const user = await userRepository.getUserById(userID)

    if(!user) {
      res.status(404).json({ error: 'User not found'})
    }

    const material = learningMaterialRepository.findAndValidateMaterialById(materialID)

    if(!material) {
      res.status(404).json({ error: 'Material not found'})
    }

    await userRepository.addMaterialToBookShelf({user, materialID})

    res.status(200).json({ msg: 'Added to bookmark succesfully', bookshelf: user.bookshelf})
  } catch (error) {
    console.error('Adding material to bookmark failed:', error.message)
    res.status(500).json({ error: `Failed to add material to bookmark. ${error.message}` })
  }
}

const getUserBookShelf = async (req, res,  userRepository, learningMaterialRepository) => {
  const { userID } = req.params

  try {
    if (!userID) {
      return res.status(400).json({ error: 'Invalid or missing parameters'})
    }

    const user = await userRepository.getUserById(userID)

    if(!user) {
      res.status(404).json({ error: 'User not found'})
    }

    const userBookShelf = await learningMaterialRepository.findLearningMaterial(user.bookshelf)

    res.status(200).json({ bookshelf: userBookShelf })
  } catch (error) {
    console.error('Fetching materials from bookshelf failed:', error.message)
    res.status(500).json({ error: 'Failed to fetch materials from bookshelf. Please try again later.' })
  }
}

const deleteFromBookshelf = async (req, res, userRepository, learningMaterialRepository) => {
  const { userID, materialID } = req.params
  try {

    if (!userID || !materialID) {
      res.status(400).json({ error: 'User ID and Material ID are both required'})
    }

    const user = await userRepository.getUserById(userID)

    if (!user) {
      res.status(404).json({ error: "User not found"})
    }

    const material = learningMaterialRepository.findAndValidateMaterialById(materialID)

    if(!material) {
      res.status(404).json({ error: 'Material not found'})
    }

    const updatedUser = await userRepository.deleteMaterialFromBookshelf({userID, materialID})

    if (!updatedUser) {
      res.status(404).json({ error: 'Error updating usr'})
    }

    res.status(200).json({ msg: 'Book removed succesfully', updatedBookshelf: updatedUser.bookshelf})

  } catch (error) {
    console.error('Error deleting book from bookshelf:', error.message)
    res.status(500).json({ error: 'Failed to delete material from bookshelf. Please try again later.' })
  }
}

module.exports = { 
  getUserData,
  uploadUserProfilePic,
  getPrograms,
  deleteUserAccount,
  addToBookMark,
  getUserBookShelf,
  deleteFromBookshelf
}