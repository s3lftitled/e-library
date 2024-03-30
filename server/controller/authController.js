const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const { redisClient } = require('../utils/redisClient')
const mongoSanitize = require('express-mongo-sanitize')
const { generateTokens } = require('../middleware/verifyToken')
const { validateEmail } = require('../validators/inputValidation')

/**
 * Logs in a user by verifying email and password, generating tokens, and setting cookies.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @param {LogRepository} logRepository - The log repository instance.
 * @returns {void}
 */
const logIn = async (req, res, userRepository, logRepository) => {
  try {
    // Sanitize user input
    req.body = mongoSanitize.sanitize(req.body)

    // Destructure request body
    const { email, password } = req.body 

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are BOTH required"})
    }

    // Validate email format
    const emailValidationResult = validateEmail(email)
    if (!emailValidationResult.isValid) {
      return res.status(400).json({ error: emailValidationResult.errorMessage })
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

    // Prepare log data
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

    // Format timestamp
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
    logData.timestamp = logData.timestamp.toLocaleString('en-PH', options)

    // Save login activity to the database only if program ID and department ID exist
    if (logData.userProgramId && logData.userDepartmentId) {
      await logRepository.createLog(logData)
    }

    // Generate tokens
    const tokens = generateTokens(user)

    // Set cookies with access and refresh tokens
    const accessToken = tokens.accessToken
    const refreshToken = tokens.refreshToken
    res.cookie('refreshToken', refreshToken, { httpOnly: true })
    res.cookie('accessToken', accessToken, { httpOnly: true })

    // Send response with tokens and user information
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

/**
 * Logs out a user by clearing cookies and deleting user-related data from Redis.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
const logOut = async (req, res) => {
  const { userID } = req.params
  try {
    // Clear cookies
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    // Delete user-related data from Redis
    await redisClient.del(`user-details:${userID}`)
    await redisClient.del(`programs:${userID}`)
    await redisClient.del(`courses:${userID}`)
    await redisClient.del(`materials:${userID}`)
    await redisClient.del(`material:${userID}`)

    // Send success message
    res.status(200).json({ msg: 'Logged out successfully' })
  } catch (error) {
    // Handle errors
    console.error('Error logging out:', error)
    res.status(500).json({ error : 'Error logging out. Please try again later.' })
  }
}

/**
 * Verifies user email by comparing verification code and updates user verification status.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {UserRepository} userRepository - The user repository instance.
 * @returns {void}
 */
const verifyEmail = async (req, res, userRepository) => {
  try {
    const { email, verificationCode } = req.body

    // Sanitize user input
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
