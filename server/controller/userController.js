const User = require('../models/user') // Importing User model
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


const findExistingUser = async (email) => {
  const existingUser = await User.findOne({ email })
  return existingUser
}

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

const createUser = async (userData, username, hashedPassword, department, program) => {
  const newUser = new User({
    email: userData.email,
    username,
    password: hashedPassword,
    verificationCode: userData.verificationCode,
    departmentID: department,
    departmentName: null,
    programID: program,
    programeName: null,
    role: userData.chosenRole,
  })

  await newUser.save()
}

const studentRegistration = async (req, res) => {
  try {
    req.body = mongoSanitize(req.body)

    console.log(req.body)

    validateUserData(req.body)

    const { email, password, chosenDepartment, chosenRole, chosenProgram } = req.body

    const existingUser = await findExistingUser(email)
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' })
    }

    if (chosenRole !== ROLES.STUDENT) {
      return res.status(400).json({ msg: 'Your role should be a student' })
    }

    const department = await Department.findById(chosenDepartment);
    if (!department) {
      return res.status(404).json({ msg: 'Department doesn\'t exist' })
    }

    const program = await Program.findById(chosenProgram);
    if (!program) {
      return res.status(404).json({ msg: 'Program doesn\'t exist' })
    }

    const verificationCode = generateVerificationCode()

    await sendVerificationEmail(email, verificationCode)

    const usernameMatch = email.match(/^([a-zA-Z0-9._-]+)@panpacificu\.edu\.ph$/)
    const username = usernameMatch ? usernameMatch[1].split('.')[0] : ''

    // Hash the password
    const hashedPassword = hashPassword(password)

    await createUser(req.body, username, hashedPassword, department, program)

    setTimeout(async () => {
      const expiredUser = await User.findOneAndDelete({ email, verified: false });
      if (expiredUser) {
        console.log(`Account for ${email} deleted due to expiration`)
      }
    }, 30 * 60 * 1000)

    res.status(200).json({ msg: 'Verification code sent. Check your email to complete registration' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}


const staffRegistration = async (req, res) => {
  try {
    req.body = mongoSanitize.sanitize(req.body)

    if (req.body.email && typeof req.body.email === 'object') {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
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

    const existingUser = await findExistingUser(email)
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
    const hashedPassword = hashPassword(password)

    // Create a new user instance
    const newUser = new User({
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
    res.status(500).json({ msg: error.message })
  }
}

const getUserData = async (req, res) => {
  const { userID } = req.params

  try {
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

    const user = await User.findById(userID)

    if (!user) {
      return res.status(404).json({ msg: 'User with that ID is not found' })
    }

    let userDepartment

    if (user.role !== ROLES.STAFF && user.role !== ROLES.LIBRARIAN) {
      // Find the department for non-staff and non-librarian users
      userDepartment = await Department.findOne({ _id: { $in: user.departmentID } })

      if (!userDepartment) {
        return res.status(404).json({ msg: 'User department is not found' })
      }
    }

    let userProgram

    if (user.role !== ROLES.STAFF && user.role !== ROLES.LIBRARIAN) {
      // Find the department for non-staff and non-librarian users
      userProgram = await Program.findOne({ _id: { $in: user.programID } })

      if (!userProgram) {
        return res.status(404).json({ msg: 'User program is not found' })
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
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

const uploadUserProfilePic =  async (req, res) => {
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

    await User.findByIdAndUpdate(userId, { profilePic: resizedImageBase64 })

    await redisClient.del(`user-details:${userId}`)

    res.status(200).json({ msg: 'Profile picture uploaded successfully', resizedImage: resizedImageBase64 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
}

const getPrograms = async (req, res) => {
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

    const user = await User.findById(userID)

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
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { 
  studentRegistration,
  staffRegistration,
  getUserData,
  uploadUserProfilePic,
  getPrograms
}