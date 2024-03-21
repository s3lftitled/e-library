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
const { errorResponse } = require('../utils/responseUtils')

const sendVerificationEmail = async (email, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD
    },
  })

  const mailOptions = {
    from: process.env.USER,
    to: email,
    subject: 'Email Verification',
    text: `Your verification code is: ${verificationCode}`,
  }

  await transporter.sendMail(mailOptions)
}

const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex')
}

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

const studentRegistration = async (req, res, userRepository) => {
  try {

    mongoSanitize(req.body)
    validateUserData(req.body)

    const { email, password, chosenDepartment, chosenRole, chosenProgram } = req.body

    const existingUser = await userRepository.findExistingUser(email)

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' })
    }

    if (chosenRole !== ROLES.STUDENT) {
      return res.status(400).json({ msg: 'Your role should be a student' })
    }

    const department = await Department.findById(chosenDepartment);
    if (!department) {
      return res.status(404).json({ msg: 'Department doesn\t exist' })
    }

    const program = await Program.findById(chosenProgram);
    if (!program) {
      return res.status(404).json({ msg: 'Program doesn\t exist' })
    }

    const verificationCode = generateVerificationCode()

    await sendVerificationEmail(email, verificationCode)

    const usernameMatch = email.match(/^([a-zA-Z0-9._-]+)@panpacificu\.edu\.ph$/)
    const username = usernameMatch ? usernameMatch[1].split('.')[0] : ''

    // Hash the password
    const hashedPassword = await hashPassword(password)

    console.log(hashedPassword)

    await userRepository.createUser({ email, username, password: hashedPassword, departmentID: department, verificationCode, programID: program, role: chosenRole })

    setTimeout(async () => {
      const expiredUser = await userRepository.findOneAndDelete({ email, verified: false });
      if (expiredUser) {
        console.log(`Account for ${email} deleted due to expiration`);
      }
    }, 30 * 60 * 1000);
    
    res.status(200).json({ msg: 'Verification code sent. Please check your email'})
  } catch (error) {
    errorResponse(res, 500, error.message)
  }
}


const staffRegistration = async (req, res, userRepository) => {
  try {
    req.body = mongoSanitize.sanitize(req.body)

    validateEmail(req.body.email)
    // Extract email and password from the request body
    const { email, password, chosenRole } = req.body

    if (!email || !password || !chosenRole) {
      return res.status(400).json({ msg: 'Please fill in all the required fields' })
    }

    // Check if the email is in the array of staff or librarian emails
    const staffEmails = ['johnlino.demonteverde@panpacificu.edu.ph'] // Add staff emails to this array
    const librarianEmails = [''] // Add librarian emails to this array

    if ((chosenRole === ROLES.STAFF && !staffEmails.includes(email)) || (chosenRole === ROLES.LIBRARIAN && !librarianEmails.includes(email))) {
      return res.status(403).json({ msg: `You are not authorized to register as a ${chosenRole}` });
    }

    const existingUser = await userRepository.findExistingUser(email)
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' })
    }

    // Validate email format
    validateEmail(email)

    // Validate password format
    validatePassword(password)

    // Generate verification code
    const verificationCode = generateVerificationCode()

    await sendVerificationEmail(email, verificationCode)

    // Extract username from email
    const usernameMatch = email.match(/^([a-zA-Z0-9._-]+)@panpacificu\.edu\.ph$/)
    const username = usernameMatch ? usernameMatch[1].split('.')[0] : ''

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create a new user instance
    await userRepository.createUser({
      email,
      username,
      password: hashedPassword,
      verificationCode,
      role: chosenRole,
    })

    // Save the new user to the database
    await newUser.save()

    // Respond with success message
    res.status(200).json({ msg: 'Verification code sent. Check your email to complete registration' })
  } catch (error) {
    // Handle errors
    errorResponse(res, 500, error.message)
  }
}

const getUserData = async (req, res, userRepository) => {
  try {
    const { userID } = req.params

    if (!userID) {
      return res.status(404).json({ msg: 'userID is not found' })
    }

    const cachedUser = await redisClient.get(`user-details:${userID}`)

    if (cachedUser) {
      try {
        const currentUser = JSON.parse(cachedUser)
        res.status(200).json({ currentUser })
        return
      } catch (err) {
        console.error('Error parsing cached programs:', err)
        res.status(500).json({ msg: 'Error retrieving programs from Redis' })
        return
      }
    }

    const user = await userRepository.getUserById(userID)

    if (!user) {
      return res.status(404).json({ msg: 'User with that ID is not found' })
    }

    let userDepartment, userProgram;

    if (user.role !== ROLES.STAFF && user.role !== ROLES.LIBRARIAN) {
      // Find the department and program for non-staff and non-librarian users
      [userDepartment, userProgram] = await Promise.all([
        Department.findOne({ _id: { $in: user.departmentID } }),
        Program.findOne({ _id: { $in: user.programID } })
      ])

      if (!userDepartment || !userProgram) {
        return res.status(404).json({ msg: 'User department or program is not found' })
      }
    }

    console.log(userProgram)

    const currentUser = ({
      email: user.email,
      username: user.username,
      departmentName: userDepartment ? userDepartment.title : 'N/A',
      programName: userProgram ? userProgram.title : 'N/A',
      profilePic: user.profilePic,
      role: user.role,
    })

    await redisClient.SET(`user-details:${userID}`, JSON.stringify(currentUser), {EX: DEFAULT_EXP})
    res.status(200).json({ currentUser })
  } catch (error) {
    errorResponse(res, 500, error.message)
  }
}

const uploadUserProfilePic =  async (req, res, userRepository) => {
  try {
    const { base64Image } = req.body
    const userId = req.params.userId

    const allowedFormats = ['jpeg', 'jpg', 'png']
    const detectedFormat = base64Image.match(/^data:image\/(\w+);base64,/)
    const imageFormat = detectedFormat ? detectedFormat[1] : null

    if (!imageFormat || !allowedFormats.includes(imageFormat.toLowerCase())) {
      return res.status(400).json({ msg: 'Unsupported image format. Please upload a JPEG, JPG, or PNG image.' })
    }

    const imageBuffer = Buffer.from(base64Image.split(',')[1], 'base64')

    const resizedImage = await sharp(imageBuffer)
      .resize({
        fit: 'cover',
        width: 200,
        height: 200,
        withoutEnlargement: true,
      })
      .toFormat(imageFormat)
      .toBuffer()

    const resizedImageBase64 = `data:image/${imageFormat};base64,${resizedImage.toString('base64')}`

    await userRepository.updateUser(userId, { profilePic: resizedImageBase64 })

    await redisClient.del(`user-details:${userId}`)

    res.status(200).json({ msg: 'Profile picture uploaded successfully', resizedImage: resizedImageBase64 })
  } catch (error) {
    errorResponse(res, 500, error.message)
  }
}

const getPrograms = async (req, res, userRepository) => {
  const { userID } = req.params

  try {
    if (!userID) {
      return res.status(404).json({ msg: 'User ID is not found' })
    }

    const cachedPrograms = await redisClient.get(`programs:${userID}`)

    if (cachedPrograms) {
      try {
        const response = JSON.parse(cachedPrograms)
        res.status(200).json({ response })
        return
      } catch (err) {
        console.error('Error parsing cached programs:', err)
        res.status(500).json({ msg: 'Error retrieving programs from Redis' })
        return
      }
    }

    const user = await userRepository.getUserById(userID)

    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    const userProgram = await Program.findById(user.programID)

    if (!userProgram) {
      return res.status(404).json({ msg: 'User program is not found' })
    }

    const restOfPrograms = await Program.find({ _id: { $ne: userProgram._id } })

    const recommendedPrograms = userProgram

    const response = {
      msg: 'Recommended Programs and Rest of the Programs:',
      recommendedPrograms,
      restOfPrograms,
    }

    await redisClient.SET(`programs:${userID}`, JSON.stringify(response), {EX: DEFAULT_EXP})
    res.status(200).json({ response })
  } catch (error) {
    errorResponse(res, 500, error.message)
  }
}

module.exports = { 
  studentRegistration,
  staffRegistration,
  getUserData,
  uploadUserProfilePic,
  getPrograms
}