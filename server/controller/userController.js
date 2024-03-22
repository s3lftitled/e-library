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

const sendVerificationEmail = async (email, verificationCode) => {
  try {
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
  } catch (error) {
    console.error('Error sending verification email:', error.message)
    throw new Error('Failed to send verification email.')
  }
}

const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex')
}

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10)
  } catch (error) {
    console.error('Error hashing password:', error.message)
    throw new Error('Failed to hash password.')
  }
}

const studentRegistration = async (req, res, userRepository) => {
  const { email, password, passwordConfirmation, chosenDepartment, chosenRole, chosenProgram } = req.body

  try {

    mongoSanitize(req.body)
    validateUserData(req.body)

    const existingUser = await userRepository.findExistingUser(email)

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    if (chosenRole !== ROLES.STUDENT) {
      return res.status(400).json({ error: 'Your role should be a student' })
    }

    const department = await Department.findById(chosenDepartment);
    if (!department) {
      return res.status(404).json({ error: 'Department doesn\t exist' })
    }

    const program = await Program.findById(chosenProgram);
    if (!program) {
      return res.status(404).json({ error: 'Program doesn\t exist' })
    }

    const usernameMatch = email.match(/^([a-zA-Z0-9._-]+)@panpacificu\.edu\.ph$/)
    const username = usernameMatch ? usernameMatch[1].split('.')[0] : ''

    if (password !== passwordConfirmation) {
      return res.status(400).json({ error: 'Password do not match'})
    }
    // Hash the password
    const hashedPassword = await hashPassword(password)

    console.log(hashedPassword)

    await userRepository.createUser({ email, username, password: hashedPassword, departmentID: department, verificationCode, programID: program, role: chosenRole })

    setTimeout(async () => {
      const expiredUser = await userRepository.findOneAndDelete({ email, verified: false });
      if (expiredUser) {
        console.log(`Account for ${email} deleted due to expiration`);
      }
    }, 30 * 60 * 1000)

    
    const verificationCode = generateVerificationCode()

    await sendVerificationEmail(email, verificationCode)
    
    res.status(200).json({ msg: 'Verification code sent. Please check your email'})
  } catch (error) {
    console.error('Student registration error:', error.message)
    res.status(500).json({ error: 'Failed to register student. Please try again later.' })
  }
}

const staffRegistration = async (req, res, userRepository) => {
  const { email, password, passwordConfirmation, chosenRole } = req.body

  try {
    req.body = mongoSanitize.sanitize(req.body)

    validateEmail(req.body.email)

    if (!email || !password || !passwordConfirmation || !chosenRole) {
      return res.status(400).json({ error: 'Please fill in all the required fields' })
    }

    // Check if the email is in the array of staff or librarian emails
    const staffEmails = ['johnlino.demonteverde@panpacificu.edu.ph'] // Add staff emails to this array
    const librarianEmails = [''] // Add librarian emails to this array

    if ((chosenRole === ROLES.STAFF && !staffEmails.includes(email)) || (chosenRole === ROLES.LIBRARIAN && !librarianEmails.includes(email))) {
      return res.status(403).json({ error: `You are not authorized to register as a ${chosenRole}` });
    }

    const existingUser = await userRepository.findExistingUser(email)
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
    
    const verificationCode = generateVerificationCode()

    await sendVerificationEmail(email, verificationCode)


    // Respond with success message
    res.status(200).json({ msg: 'Verification code sent. Check your email to complete registration' })
  } catch (error) {
    // Handle errors
    console.error('Staff registration error:', error.message)
    res.status(500).json({ error: 'Failed to register staff. Please try again later.' })
  }
}

const getUserData = async (req, res, userRepository) => {
  const { userID } = req.params
  
  try {

    if (!userID) {
      return res.status(404).json({ error: 'userID is not found' })
    }

    const cachedUser = await redisClient.get(`user-details:${userID}`)

    if (cachedUser) {
      try {
        const currentUser = JSON.parse(cachedUser)
        res.status(200).json({ currentUser })
        return
      } catch (error) {
        console.error('Error parsing cached programs:', error)
        res.status(500).json({ error: 'Error retrieving programs from Redis' })
        return
      }
    }

    const user = await userRepository.getUserById(userID)

    if (!user) {
      return res.status(404).json({ error: 'User with that ID is not found' })
    }

    let userDepartment, userProgram

    if (user.role !== ROLES.STAFF && user.role !== ROLES.LIBRARIAN) {
      // Find the department and program for non-staff and non-librarian users
      [userDepartment, userProgram] = await Promise.all([
        Department.findOne({ _id: { $in: user.departmentID } }),
        Program.findOne({ _id: { $in: user.programID } })
      ])

      if (!userDepartment || !userProgram) {
        return res.status(404).json({ error: 'User department or program is not found' })
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
    console.error('Get user data error:', error.message)
    res.status(500).json({ error: 'Failed to retrieve user data. Please try again later.' })
  }
}

const uploadUserProfilePic =  async (req, res, userRepository) => {
  const { base64Image } = req.body
  const userId = req.params.userId

  try {
    const allowedFormats = ['jpeg', 'jpg', 'png']
    const detectedFormat = base64Image.match(/^data:image\/(\w+);base64,/)
    const imageFormat = detectedFormat ? detectedFormat[1] : null

    if (!imageFormat || !allowedFormats.includes(imageFormat.toLowerCase())) {
      return res.status(400).json({ error: 'Unsupported image format. Please upload a JPEG, JPG, or PNG image.' })
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
    console.error('Upload profile picture error:', error.message)
    res.status(500).json({ error: 'Failed to upload profile picture. Please try again later.' })
  }
}

const getPrograms = async (req, res, userRepository) => {
  const { userID } = req.params

  try {
    if (!userID) {
      return res.status(404).json({ error: 'User ID is not found' })
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
      return res.status(404).json({ error: 'User not found' })
    }

    const userProgram = await Program.findById(user.programID)

    if (!userProgram) {
      return res.status(404).json({ error: 'User program is not found' })
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
    console.error('Get programs error:', error.message)
    res.status(500).json({ error: 'Failed to retrieve programs. Please try again later.' })
  }
}

module.exports = { 
  studentRegistration,
  staffRegistration,
  getUserData,
  uploadUserProfilePic,
  getPrograms
}