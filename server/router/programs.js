const express = require('express')
const router = express.Router()
const { Program } = require('../models/e-book')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const User = require('../models/user')
const { verifyToken } = require('../middleware/verifyToken')

// Create a program
router.post('/create-programs', async (req, res) => {
  const { title, description } = req.body
  try {
    // Check if required fields are filled
    if (!title || !description) {
      return res.status(500).json({ msg: 'Please fill in the required fields'})
    }

    // Check if a program with the same title already exists
    const existingProgram = await Program.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })

    // If program with the same title exists, return an error
    if (existingProgram) {
      return res.status(400).json({ msg: 'Program already exists '})
    }

    // Create a new program with the provided title and description
    const program = new Program({ title, description, courses: [] })
    await program.save()

    // Respond with the created program
    res.status(201).json(program)
  } catch (error) {
      // Handle errors and respond with an error message
      res.status(500).json({ error: error.message })
  }
})

// GET all the programs
router.get('/get-programs', verifyToken, checkRole([ROLES.STAFF]), async (req, res) => {
  try {
    // Retrieve all programs from the database
    const programs = await Program.find({})

    // Respond with the list of programs
    res.status(200).json({ programs })
  } catch (error) {
    // Handle errors and respond with an error message
    res.status(500).json({ error: error.message })
  }
})

module.exports = router