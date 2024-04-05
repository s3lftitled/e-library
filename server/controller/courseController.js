const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')

/**
 * Creates a new course within a program.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {CourseRepository} courseRepository - The course repository instance.
 * @param {ProgramRepository} programRepository - The program repository instance.
 * @returns {void}
 */
const createCourse = async (req, res, courseRepository, programRepository) => {
  const { programID }  = req.params
  const { title }  = req.body

  try {
    // Validate input data
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }

    // Find the program by ID
    const program = await programRepository.findProgramByID(programID)

    // If program not found, return an error
    if (!program) {
        return res.status(404).json({ error: 'Program not found' })
    }

    // Check if a course with the same title already exists
    const existingCourse = await courseRepository.findExistingCourseByTitle(title)

    // If course with the same title exists, return an error
    if (existingCourse) {
      return res.status(400).json({ error: `Course subject: ${title} already exists `})
    }

    // Create a new course with the provided title
    const course = await courseRepository.createCourse(title)

    // Add the new course to the program's list of courses
    program.courses.push(course._id)
    await programRepository.updateProgramCourses(programID, program.courses)
    
    // Respond with the created course
    res.status(201).json(course)
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error creating course:', error)
    res.status(500).json({ error: 'Failed to create course. Please try again later.' })
  }
}

/**
 * Retrieves all courses within a program.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {ProgramRepository} programRepository - The program repository instance.
 * @returns {void}
 */
const getCoursesWithInPrograms = async (req, res, programRepository) => {
  const { programId, userID } = req.params

  try {
    const cachedCourses = await redisClient.get(`courses:${userID}`)
    // Find the program by ID and populate the courses field
    if (cachedCourses) {
      try {
         // Respond with cached courses if available
        const courses = JSON.parse(cachedCourses)
        console.log('cached retrieved')
        res.status(200).json({ courses })
        return
      } catch (err) {
         // Handle parsing error
        console.error('Error parsing cached programs:', err)
        res.status(500).json({ error: 'Error retrieving programs from Redis' })
        return
      }
    }

     // Find the program by ID and populate the courses field
    const program = await programRepository.findProgramByIdWithCourses(programId)

    // If program not found, return an error
    if (!program) {
        return res.status(404).json({ error: 'Program not found' })
    }

    // Extract the courses from the program and respond
    const courses = program.courses
    // Cache the retrieved courses for the given user ID in Redis with expiration time
    await redisClient.set(`courses:${userID}`, JSON.stringify(courses), "EX", DEFAULT_EXP)
    // Respond with the retrieved courses
    res.status(200).json({ courses })
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error retrieving courses:', error);
    res.status(500).json({ error: 'Failed to retrieve courses. Please try again later.' })
  }
}

module.exports = {
  createCourse,
  getCoursesWithInPrograms
}