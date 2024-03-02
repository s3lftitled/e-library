const express = require('express')
const router = express.Router()
const { LearningMaterial, Course, Program, Department } = require('../models/e-book')
const User = require('../models/user')

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
router.get('/programs/:programId/courses', async (req, res) => {
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

// Create a program
router.post('/programs', async (req, res) => {
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

// Create a department
router.post('/department', async (req, res) => {
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

// GET all the programs
router.get('/programs', async (req, res) => {
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

// GET all the programs
router.get('/department', async (req, res) => {
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

// Get programs + recommended programs
router.get('/:userID/programs', async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(404).json({ msg: 'User ID is not found' });
    }

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const userDepartment = await Department.findById(user.departmentID)

    if (!userDepartment) {
      return res.status(404).json({ msg: 'User department is not found' })
    }

    const recommendedPrograms = await Program.find({ _id: { $in: userDepartment.programs } });
    const restOfPrograms = await Program.find({ _id: { $nin: recommendedPrograms.map(p => p._id) } })

    res.status(200).json({
      msg: 'Recommended Programs and Rest of the Programs:',
      recommendedPrograms,
      restOfPrograms,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// Export the router for use in other parts of the application
module.exports = router
