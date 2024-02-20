const User = require('../models/user')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const crypto = require('crypto')
require('dotenv').config()

router.post('/registration', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const existingUser = await User.findOne({ username });

    const emailRegex = /^[a-zA-Z0-9._-]+@panpacificu\.edu\.ph$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Invalid email format. Please use your panpacific email' });
    }

    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: 'Password should have capital letters, numbers and symbols',
      });
    }

    const verificationCode = crypto.randomBytes(3).toString('hex');

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.USER, 
        pass: process.env.PASSWORD
      },
    });

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    }

    await transporter.sendMail(mailOptions)

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = User({
      email,
      username,
      password: hashedPassword,
      verificationCode
    })

    await newUser.save()

    res.status(200).json({ msg: 'Verification code sent. Check your email to complete registration' });
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
})

router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ msg: 'User not found' })
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ msg: 'Incorrect verification code' })
    }

    user.verified = true
    user.verificationCode = null
    await user.save()

    res.status(200).json({ msg: 'Email verified successfully. User registered.' })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password} = req.body 

    const user = await User.findOne({ email })

    if (!user) {
      res.status(404).json({ msg: 'User not found' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ msg: 'Incorrect password. Please try again.'})
    }

    res.status(200).json({ userID: user._id, msg: 'User logged in successfully' })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
})

module.exports = router
