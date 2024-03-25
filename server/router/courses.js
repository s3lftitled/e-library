// Import necessary modules and packages
const express = require('express')
const router = express.Router()

// Import repositories, middleware, and controllers
const CourseRepository = require('../repositories/courseRepository')
const ProgramRepository = require('../repositories/programRepository')
const { checkRole, ROLES } = require('../middleware/auth-middleWare')
const {
  createCourse,
  getCoursesWithInPrograms
} = require('../controller/courseController')

// Create instances of repositories
const courseRepository = new CourseRepository()
const programRepository = new ProgramRepository()

// Route for creating a course within a program
router.post('/programs/:programID/create-course', 
  (req, res) => createCourse(req, res, courseRepository, programRepository)
)

// Route for getting courses within a program
router.get('/:programId/courses/:userID', 
  (req, res) => getCoursesWithInPrograms(req, res, programRepository)
)

// Export the router for use in other files
module.exports = router
