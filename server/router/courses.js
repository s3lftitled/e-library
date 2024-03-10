const express = require('express')
const router = express.Router()
const { LearningMaterial, Course, Program } = require('../models/e-book')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const User = require('../models/user')
const { verifyToken } = require('../middleware/verifyToken')

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

// Create a learning material within course subjects
router.post('/programs/:programId/courses/:courseId/learningMaterials', async (req, res) => {
  const { programId, courseId } = req.params

  try {
      // Find the course within the specified program
      const course = await Course.findOne({ _id: courseId, program: programId })

      // If course not found, return an error
      if (!course) {
          return res.status(404).json({ error: 'Course not found in the specified program' })
      }

      // Create a new learning material using the request body
      const learningMaterial = await LearningMaterial.create(req.body)

      // Add the learning material to the course's list of materials
      course.learningMaterials.push(learningMaterial._id)
      await course.save()

      // Respond with the created learning material
      res.status(201).json(learningMaterial)
  } catch (error) {
      // Handle errors and respond with an error message
      res.status(500).json({ error: error.message })
  }
})

// GET courses within a program
router.get('/:programId/courses', async (req, res) => {
  const { programId } = req.params;

  try {
      // Find the program by ID and populate the courses field
      const program = await Program.findById(programId).populate('courses',)

      // If program not found, return an error
      if (!program) {
          return res.status(404).json({ error: 'Program not found' })
      }

      // Extract the courses from the program and respond
      const courses = program.courses
      res.status(200).json({ courses })
  } catch (error) {
      // Handle errors and respond with an error message
      res.status(500).json({ error: error.message })
  }
})

module.exports = router