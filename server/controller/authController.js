const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const { redisClient } = require('../utils/redisClient')
const mongoSanitize = require('express-mongo-sanitize')
const { generateTokens } = require('../middleware/verifyToken')
const {  validateEmail } = require('../validators/inputValidation')

const logIn = async (req, res, userRepository, logRepository) => {
  try {
    // Sanitize user input
    req.body = mongoSanitize.sanitize(req.body)

    // Destructure request body
    const { email, password } = req.body 

    const emailValidationResult = validateEmail(email)
    if (!emailValidationResult.isValid) {
      return res.status(400).json({ error: emailValidationResult.errorMessage })
    }

    // Validate email format
    if (req.body.email && typeof req.body.email === 'object') {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Find user by email
    const user = await userRepository.findUserByEmail(email)

    // If user not found
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect password. Please try again.'})
    }

    // If user's email is not verified
    if(user.verificationCode !== null) {
      return res.status(400).json({ error: 'Please verify your email first'})
    }

    const logData = {
      userId: user._id,
      timestamp: new Date(),
      action: 'login',
    }

     // Add user's program ID and department ID to logData if they exist
     if (user.programID) {
      logData.userProgramId = user.programID;
    }
    if (user.departmentID) {
      logData.userDepartmentId = user.departmentID;
    }

    const options = {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }

    const formattedDateTime = logData.timestamp.toLocaleString('en-PH', options)

    logData.timestamp = formattedDateTime

    // Save login activity to the database only if program ID and department ID exist
    if (logData.userProgramId && logData.userDepartmentId) {
      await logRepository.createLog(logData)
    }

    const tokens = generateTokens(user)

    const accessToken = tokens.accessToken
    const refreshToken = tokens.refreshToken

    res.cookie('refreshToken', refreshToken, { httpOnly: true })
    res.cookie('accessToken', accessToken, { httpOnly: true })

    console.log('access:', accessToken)
    console.log("refresh:", refreshToken)

    res.status(200).json({
      accessToken,
      refreshToken,
      userID: user._id,
      role: user.role,
      msg: 'User logged in successfully'
    })
  } catch (error) {
    // Handle errors
    console.error('Error logging in:', error);
    res.status(500).json({ error : `Error logging in. ${error.message} ` })
  }
}

const logOut =  async (req, res) => {
  const { userID } = req.params
  try {
    // Clear cookies (assuming you're using cookies for authentication)
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    console.log(`user-details:${userID}`)
    await redisClient.del(`user-details:${userID}`)
    await redisClient.del(`programs:${userID}`)
    await redisClient.del(`courses:${userID}`)
    await redisClient.del(`materials:${userID}`)
    await redisClient.del(`material:${userID}`)

    res.status(200).json({ msg: 'Logged out successfully' })
  } catch (error) {
    // Handle errors
    console.error('Error logging out:', error)
    res.status(500).json({ error : 'Error logging out. Please try again later.' })
  }
}

const verifyEmail = async (req, res, userRepository) => {
  try {
    const { email, verificationCode } = req.body

    req.body = mongoSanitize(req.body)

    // Find user by email
    const user = await userRepository.findUserByEmail(email)

    // If user not found
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // If verification code is incorrect
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Incorrect verification code' })
    }

    // Update user's verification status
    user.verified = true
    user.verificationCode = null
    await user.save()

    // Respond with success message
    res.status(200).json({ msg: 'Email verified successfully. User registered.' })
  } catch (error) {
    // Handle errors
    console.error('Error verifying email:', error)
    res.status(500).json({ error : 'Error verifying email. Please try again later.' })
  }
}

module.exports = { logIn, logOut, verifyEmail }