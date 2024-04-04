const { Department, Program } = require('../models/e-book')
const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const nodemailer = require('nodemailer') // Importing nodemailer for sending emails
const crypto = require('crypto') // Importing crypto for generating random codes
const sharp = require('sharp')
const mongoSanitize = require('express-mongo-sanitize')
require('dotenv').config() // Loading environment variables
const {  ROLES } = require('../middleware/auth-middleWare')
const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')
const { 
  validateUserData,
  validateEmail,
  validatePassword
} = require('../validators/inputValidation')
const { updateSearchIndex } = require('../models/user')

/**
 * Sends a verification email with a verification code.
 * 
 * @param {string} email - The recipient's email address.
 * @param {string} verificationCode - The verification code to be sent.
 * @returns {Promise<void>} - A Promise that resolves once the email is sent.
 */
const sendVerificationEmail = async (email, verificationCode) => {
  try {
     // Create a transporter using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
      },
    })

    // Configure email options
    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    }

    // Send the email
    await transporter.sendMail(mailOptions)
  } catch (error) {
    // Handle errors and throw an error for the caller to handle
    console.error('Error sending verification email:', error.message)
    throw new Error('Failed to send verification email.')
  }
}

/**
 * Generates a random verification code.
 * 
 * @returns {string} - The generated verification code.
 */
const generateVerificationCode = () => {
  // Generate random bytes and convert them to hexadecimal string
  return crypto.randomBytes(3).toString('hex')
}

/**
 * Hashes a password using bcrypt.
 * 
 * @param {string} password - The password to be hashed.
 * @returns {Promise<string>} - A Promise that resolves with the hashed password.
 */
const hashPassword = async (password) => {
  try {
    // Hash the password with bcrypt
    return await bcrypt.hash(password, 10)
  } catch (error) {
     // Handle errors and throw an error for the caller to handle
    console.error('Error hashing password:', error.message)
    throw new Error('Failed to hash password.')
  }
}

/**
 * Handles registration of a student.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @returns {void}
 */
const studentRegistration = async (req, res, userRepository) => {
  // Extracts necessary details from request body
  const { email, password, passwordConfirmation, chosenDepartment, chosenRole, chosenProgram } = req.body

  try {
    // Sanitize user input
    mongoSanitize(req.body)
    // Validate user data
    validateUserData(req.body)

    // Check if user already exists
    const existingUser = await userRepository.findExistingUser(email)

    // If user already exists, returns an error
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Validate chosen role
    if (chosenRole !== ROLES.STUDENT) {
      return res.status(400).json({ error: 'Your role should be a student' })
    }

    // Check if the chosen department exists
    const department = await Department.findById(chosenDepartment);
    if (!department) {
      return res.status(404).json({ error: 'Department doesn\t exist' })
    }

    // Check if the chosen program exists
    const program = await Program.findById(chosenProgram);
    if (!program) {
      return res.status(404).json({ error: 'Program doesn\t exist' })
    }

      // Extract username from email
    const usernameMatch = email.match(/^([a-zA-Z0-9._-]+)@panpacificu\.edu\.ph$/)
    const username = usernameMatch ? usernameMatch[1].split('.')[0] : ''

    // Check if password and password confirmation match
    if (password !== passwordConfirmation) {
      return res.status(400).json({ error: 'Password do not match'})
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Generate verification code
    const verificationCode = generateVerificationCode()

    // Create user in the database
    await userRepository.createUser({ email, username, password: hashedPassword, departmentID: department, verificationCode, programID: program, role: chosenRole })

    // Set timeout to delete unverified user after a certain period
    setTimeout(async () => {
      const expiredUser = await userRepository.findOneAndDelete({ email, verified: false });
      if (expiredUser) {
        console.log(`Account for ${email} deleted due to expiration`);
      }
    }, 30 * 60 * 1000)

    // Send verification email
    await sendVerificationEmail(email, verificationCode)
    
     // Respond with success message
    res.status(200).json({ msg: 'Verification code sent. Please check your email'})
  } catch (error) {
     // Handle errors
    console.error('Student registration error:', error.message)
    res.status(500).json({ error: `Failed to register student. ${error.message} ` })
  }
}

/**
 * Handles registration of staff.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @returns {void}
 */
const staffRegistration = async (req, res, userRepository) => {
   // Extracts necessary details from request body
  const { email, password, passwordConfirmation, chosenRole } = req.body

  try {
     // Sanitize user input
    req.body = mongoSanitize.sanitize(req.body)

     // Validate email format
    validateEmail(req.body.email)

    // Check if required fields are provided
    if (!email || !password || !passwordConfirmation || !chosenRole) {
      return res.status(400).json({ error: 'Please fill in all the required fields' })
    }

    // Check if the email is in the array of staff or librarian emails
    const staffEmails = ['johnlino.demonteverde@panpacificu.edu.ph'] // Add staff emails to this array
    const librarianEmails = ['johnlino.demonteverde@panpacificu.edu.ph'] // Add librarian emails to this array

    // Check if user role is authorized to register
    if ((chosenRole === ROLES.STAFF && !staffEmails.includes(email)) || (chosenRole === ROLES.LIBRARIAN && !librarianEmails.includes(email))) {
      return res.status(403).json({ error: `You are not authorized to register as a ${chosenRole}` });
    }

    // Check if user already exists
    const existingUser = await userRepository.findExistingUser(email)
    
    // If user already exists, returns an error
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Validate email format
    validateEmail(email)

    // Validate password format
    validatePassword(password)
    
    // Extract username from email
    const usernameMatch = email.match(/^([a-zA-Z0-9._-]+)@panpacificu\.edu\.ph$/)
    const username = usernameMatch ? usernameMatch[1].split('.')[0] : ''

    // Check if password and passwordConfirmation matches
    if (password !== passwordConfirmation) {
      return res.status(400).json({ error: 'Password do not match'})
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Generate verification code
    const verificationCode = generateVerificationCode()

    // Create a new user instance
    await userRepository.createUser({
      email,
      username,
      password: hashedPassword,
      verificationCode,
      role: chosenRole,
    })

    // Send verification code
    await sendVerificationEmail(email, verificationCode)

    // Respond with success message
    res.status(200).json({ msg: 'Verification code sent. Check your email to complete registration' })
  } catch (error) {
    // Handle errors
    console.error('Staff registration error:', error.message)
    res.status(500).json({ error: 'Failed to register staff. Please try again later.' })
  }
}

/**
 * Retrieves user data including email, username, department, program, profile picture, and role.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @returns {void}
 */
const getUserData = async (req, res, userRepository) => {
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
      // Find the department and program for non-staff and non-librarian users
      [userDepartment, userProgram] = await Promise.all([
        Department.findOne({ _id: { $in: user.departmentID } }),
        Program.findOne({ _id: { $in: user.programID } })
      ])

       // Check if department or program is not found
      if (!userDepartment || !userProgram) {
        return res.status(404).json({ error: 'User department or program is not found' })
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

module.exports = { 
  studentRegistration,
  staffRegistration,
  getUserData,
  uploadUserProfilePic,
  getPrograms,
  deleteUserAccount,
  addToBookMark,
  getUserBookShelf
}