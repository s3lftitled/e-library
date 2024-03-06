const express = require('express')
const router = express.Router()
const { Program, Department } = require('../models/e-book')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const User = require('../models/user')
const { verifyToken } = require('../middleware/verifyToken')

// Create a department
router.post('/create-department', async (req, res) => {
  const { title } = req.body

  try {
    if (!title) {
      return res.status(400).json({ msg: 'Please fill in the required fields' })
    }

    const existingDepartment = await Department.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })

    if (existingDepartment) {
      return res.status(400).json({ msg: 'Department already exists '})
    }

    const department = new Department({ title })
    await department.save()

    res.status(201).json({ msg: 'Department has been created succesfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/department/:departmentID/programs/:programID', async (req, res) => {
  const { departmentID, programID } = req.params

  try {
    if (!programID || !departmentID) {
      return res.status(404).json({ msg: 'Please fill in the required fields' })
    }

    const program = await Program.findById(programID)
    const department = await Department.findById(departmentID)

    if (!program || !department) {
      return res.status(404).json({ msg: 'Program is not found' })
    }

    const existingProgram = await Department.findOne({ programs: program._id })

    if (existingProgram) {
      return res.status(400).json({ msg: 'Program already in the department'})
    }

    department.programs.push(program)
    await department.save()

    res.status(201).json({ msg: `${program.title} has been succesfully added to ${department.title}`})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET all the department
router.get('/get-departments', async (req, res) => {
  try {
    // Retrieve all programs from the database
    const department = await Department.find({})

    // Respond with the list of programs
    res.status(200).json({ department })
  } catch (error) {
    // Handle errors and respond with an error message
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
