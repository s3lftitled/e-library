const CourseRepository = require('../repositories/courseRepository')
const ProgramRepository = require('../repositories/programRepository')
const express = require('express')
const router = express.Router()
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const {
  createCourse,
  getCoursesWithInPrograms
} = require('../controller/courseController')

const courseRepository = new CourseRepository()
const programRepository = new ProgramRepository()

// Create a course within a program
router.post('/programs/:programId/courses', (req, res) => createCourse(req, res, courseRepository, programRepository ))

// GET courses within a program
router.get('/:programId/courses', (req, res) => getCoursesWithInPrograms(req, res, programRepository))

module.exports = router