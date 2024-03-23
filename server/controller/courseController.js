const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')

const createCourse = async (req, res, courseRepository, programRepository) => {
  const { programID }  = req.params
  const { title }  = req.body

  try {
    console.log(programID)
    console.log(title)
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

const getCoursesWithInPrograms = async (req, res, programRepository) => {
  const { programId, userID } = req.params

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
        res.status(500).json({ error: 'Error retrieving programs from Redis' })
        return
      }
    }

    const program = await programRepository.findProgramByIdWithCourses(programId)

    // If program not found, return an error
    if (!program) {
        return res.status(404).json({ error: 'Program not found' })
    }

    // Extract the courses from the program and respond
    const courses = program.courses
    await redisClient.SET(`courses:${userID}`, JSON.stringify(courses), {EX: DEFAULT_EXP})
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