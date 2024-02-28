// Import necessary modules and packages
const User = require('../models/user') // Importing User model
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const nodemailer = require('nodemailer') // Importing nodemailer for sending emails
const crypto = require('crypto') // Importing crypto for generating random codes
const jwt = require('jsonwebtoken') // Importing jsonwebtoken for user authentication
require('dotenv').config() // Loading environment variables
const { Department } = require('../models/e-book')

// User registration endpoint
router.post('/registration', async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password, departmentTitle } = req.body

    if (!email || !password || !departmentTitle) {
      return res.status(404).json({ msg: 'Please fill in all the required fields' })
    }

    // Find the email and assign it to existingUser variable
    const existingUser = await User.findOne({ email })

      // Check if user already exists
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' })
    }

    // Find the department and assign it to department variable
    const department = await Department.findOne({ title: departmentTitle })

    // Validate if department exists
    if(!department) {
      return res.status(404).json({ msg: 'Department doesnt exists' })
    }

    // Regular expression to match panpacific email format
    const emailRegex = /^[a-zA-Z0-9._-]+@panpacificu\.edu\.ph$/

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format. Please use your panpacific email' })
    }

    // Regular expression to enforce password requirements
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/

    // Validate password format
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: 'Password should have capital letters, numbers and symbols',
      })
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(3).toString('hex')

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER, // Email sender's username
        pass: process.env.PASSWORD // Email sender's password
      },
    })

    // Mail options for sending verification code
    const mailOptions = {
      from: process.env.USER, // Sender's email
      to: email, // Recipient's email
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    }

    // Send verification code via email
    await transporter.sendMail(mailOptions)

    // Extract username from email
    const usernameMatch = email.match(/^([a-zA-Z0-9._-]+)@panpacificu\.edu\.ph$/)
    const username = usernameMatch ? usernameMatch[1].split('.')[0] : ''

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user instance
    const newUser = User({
      email,
      username,
      password: hashedPassword,
      verificationCode,
      department
    })

    // Save the new user to the database
    await newUser.save()

    // Respond with success message
    res.status(200).json({ msg: 'Verification code sent. Check your email to complete registration' })
  } catch (error) {
    // Handle errors
    res.status(500).json({ msg: error.message })
  }
})

// Email Verification endpoint
router.post('/verify-email', async (req, res) => {
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
})

// User Log In endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password} = req.body 

    // Find user by email
    const user = await User.findOne({ email })

    // If user not found
    if (!user) {
      res.status(404).json({ msg: 'User not found' })
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

    // Generate JWT token for authentication
    const token =  jwt.sign({ id: user._id}, process.env.SECRET_KEY)
    res.status(200).json({ token, userID: user._id, msg: 'User logged in successfully' })
  } catch (error) {
    // Handle errors
    res.status(500).json({ msg: error.message })
  }
})

module.exports = router
