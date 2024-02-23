const express = require('express')
const router = express.Router()
const { LearningMaterial, Course, Program } = require('../models/e-book')

// Create a learning material within course subjects
router.post('/programs/:programId/courses/:courseId/learningMaterials', async (req, res) => {
    const { programId, courseId } = req.params

    try {
        const course = await Course.findOne({ _id: courseId, program: programId })

        if (!course) {
            return res.status(404).json({ error: 'Course not found in the specified program' })
        }

        const learningMaterial = await LearningMaterial.create(req.body)
        course.learningMaterials.push(learningMaterial._id)
        await course.save();

        res.status(201).json(learningMaterial)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Create a course within a programs
router.post('/programs/:programId/courses', async (req, res) => {
  const { programId } = req.params
  const { title } = req.body
  try {
      const program = await Program.findById(programId)

      if (!program) {
          return res.status(404).json({ error: 'Program not found' })
      }

      const existingCourse = await Course.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })

      if (existingCourse) {
        return res.status(400).json({ msg: `Course subject: ${title} already exists `})
      }

      const course = new Course({ title })
      program.courses.push(course)
      await program.save()

      res.status(201).json(course)
  } catch (error) {
      res.status(500).json({ error: error.message })
  }
})

// Create a program
router.post('/programs', async (req, res) => {
    const { title, description } = req.body
    try {
      const existingProgram = await Program.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })

      if (existingProgram) {
        return res.status(400).json({ msg: 'Program already exists '})
      }

      const program = new Program({ title, description })
      res.status(201).json(program)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router