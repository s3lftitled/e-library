const User = require('../models/user') // Importing User model
const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const Log = require('../models/log')

const logIn = async (req, res) => {
  try {
    req.body = mongoSanitize.sanitize(req.body)

    if (req.body.email && typeof req.body.email === 'object') {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    const { email, password } = req.body 

    // Find user by email
    const user = await User.findOne({ email })

    // If user not found
    if (!user) {
      return res.status(404).json({ msg: 'User not found' })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ msg: 'Incorrect password. Please try again.'})
    }

    // If user's email is not verified
    if(user.verificationCode !== null) {
      return res.status(400).json({ msg: 'Please verify your email first'})
    }

    const log = new Log({
      userId: user._id,
      userProgramId: user.programID, 
      userDepartmentId: user.departmentID, 
      timestamp: new Date(),
      action: 'login',
    })

    await log.save()

    const tokens = generateTokens(user)

    const accessToken = tokens.accessToken
    const refreshToken = tokens.refreshToken

    res.cookie('refreshToken', refreshToken, { httpOnly: true });
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
    res.status(500).json({ msg: error.message })
  }
}

const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    // If user not found
    if (!user) {
      return res.status(400).json({ msg: 'User not found' })
    }

    // If verification code is incorrect
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ msg: 'Incorrect verification code' })
    }

    // Update user's verification status
    user.verified = true
    user.verificationCode = null
    await user.save()

    // Respond with success message
    res.status(200).json({ msg: 'Email verified successfully. User registered.' })
  } catch (error) {
    // Handle errors
    res.status(500).json({ msg: error.message })
  }
}

module.exports = { logIn, verifyEmail }