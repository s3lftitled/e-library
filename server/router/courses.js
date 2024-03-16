const express = require('express')
const router = express.Router()
const { LearningMaterial, Course, Program } = require('../models/e-book')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const User = require('../models/user')
const { verifyToken } = require('../middleware/verifyToken')
const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')

// Create a course within a program
router.post('/programs/:programId/courses', async (req, res) => {
  const { programId } = req.params
  const { title } = req.body
  try {
      // Find the program by ID
      const program = await Program.findById(programId)

      // If program not found, return an error
      if (!program) {
          return res.status(404).json({ error: 'Program not found' })
      }

      // Check if a course with the same title already exists
      const existingCourse = await Course.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })

      // If course with the same title exists, return an error
      if (existingCourse) {
        return res.status(400).json({ msg: `Course subject: ${title} already exists `})
      }

      // Create a new course with the provided title
      const course = await Course.create({ title })

      // Add the new course to the program's list of courses
      program.courses.push(course._id)
      await program.save()
     
      // Respond with the created course
      res.status(201).json(course)
  } catch (error) {
      // Handle errors and respond with an error message
      res.status(500).json({ error: error.message })
  }
})

// GET courses within a program
router.get('/:programId/courses', async (req, res) => {
  const { programId } = req.params;

  try {

      const cachedCourses = await redisClient.get(`courses:${programId}`)
      // Find the program by ID and populate the courses field
      if (cachedCourses) {
        try {
          const courses = JSON.parse(cachedCourses)
          res.status(200).json({ courses })
          return
        } catch (err) {
          console.error('Error parsing cached programs:', err)
          res.status(500).json({ msg: 'Error retrieving programs from Redis' })
          return
        }
      }

      const program = await Program.findById(programId).populate('courses',)

      // If program not found, return an error
      if (!program) {
          return res.status(404).json({ error: 'Program not found' })
      }

      // Extract the courses from the program and respond
      const courses = program.courses
      await redisClient.SET(`courses:${programId}`, JSON.stringify(courses), {EX: DEFAULT_EXP})
      res.status(200).json({ courses })
  } catch (error) {
      // Handle errors and respond with an error message
      res.status(500).json({ error: error.message })
  }
})

module.exports = router