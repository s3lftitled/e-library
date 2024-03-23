const { Program, Department } = require('../models/e-book')
const User = require('../models/user')
const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')

const clearAllProgramsCache = async () => {
  try {
    const allUserIds = await User.find({}, '_id');

    for (const userIdObj of allUserIds) {
      const userId = userIdObj._id.toString();
      await redisClient.del(`programs:${userId}`)
    }
    await redisClient.del("programs")
  } catch (error) {
    console.error('Error clearing programs cache for all users:', error)
  }
}

const createProgram =  async (req, res, programRepository) => {
  const { title, description } = req.body
  
  try {
    console.log('creating program...')
    // Check if required fields are filled
    if (!title || !description) {
      return res.status(500).json({ error: 'Please provide both title and description'})
    }

    // Check if a program with the same title already exists
    const existingProgram = await programRepository.findExistingProgramByTitle(title)

    // If program with the same title exists, return an error
    if (existingProgram) {
      return res.status(400).json({ error: 'Program already exists '})
    }

    // Create a new program with the provided title and description
    const program = await programRepository.createProgram(title, description)

    await clearAllProgramsCache()

    // Respond with the created program
    res.status(201).json({ program, msg: 'Program has been created succesfully' })
  } catch (error) {
      // Handle errors and respond with an error message
    console.error('Error creating program:', error)
    res.status(500).json({ error: 'Failed to create program. Please try again later.' })
  }
}

const getAllPrograms = async (req, res, programRepository) => {
  try {
    const cachedPrograms = await redisClient.get(`programs`)

    if (cachedPrograms) {
      try {
        const programs = JSON.parse(cachedPrograms)
        return res.status(200).json({ programs })
      } catch (error) {
        console.error('Error parsing cached programs:', error)
        res.status(500).json({ error: 'Error retrieving programs from Redis' })
        return
      }
    }
    // Retrieve all programs from the database
    const programs = await programRepository.getAllPrograms()

    await redisClient.SET("programs", JSON.stringify(programs), {EX: DEFAULT_EXP})
    // Respond with the list of programs
    res.status(200).json({ programs })
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error fetching programs:', error)
    res.status(500).json({ error: 'Failed to fetch programs. Please try again later.' })
  }
}

const getDepartmentPrograms = async (req, res, programRepository, departmentRepository) => {
  const { departmentID } = req.params

  try {
    // Find the department by ID
    const department = await departmentRepository.findDepartmentByID(departmentID)

    if (!department) {
      return res.status(404).json({ error: 'Department not found' })
    }

    // Retrieve the details of the programs within the department
    const programIds = department.programs
    const programs = await programRepository.getProgramByIds(programIds)

    // Respond with the list of programs
    res.status(200).json({ programs })
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error fetching department programs:', error)
    res.status(500).json({ error: 'Failed to fetch department programs. Please try again later.' })
  }
}
 
module.exports = { 
  createProgram,
  getAllPrograms,
  getDepartmentPrograms
}
