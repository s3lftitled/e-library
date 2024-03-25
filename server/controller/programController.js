const { Program, Department } = require('../models/e-book')
const User = require('../models/user')
const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')

/**
 * Clears cached programs for all users from Redis.
 * 
 * @returns {void}
 */
const clearAllProgramsCache = async () => {
  try {
    // Retrieve all user IDs
    const allUserIds = await User.find({}, '_id');

    // Iterate over each user ID and clear cached programs
    for (const userIdObj of allUserIds) {
      const userId = userIdObj._id.toString();
      await redisClient.del(`programs:${userId}`)
    }

     // Clear global programs cache
    await redisClient.del("programs")
  } catch (error) {
    console.error('Error clearing programs cache for all users:', error)
  }
}

/**
 * Creates a new program.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {ProgramRepository} programRepository - The program repository instance.
 * @returns {void}
 */
const createProgram =  async (req, res, programRepository) => {
  // Extracts title and description from request body
  const { title, description } = req.body
  
  try {
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

    // Clear programs cache for all users
    await clearAllProgramsCache()

    // Respond with the created program
    res.status(201).json({ program, msg: 'Program has been created succesfully' })
  } catch (error) {
      // Handle errors and respond with an error message
    console.error('Error creating program:', error)
    res.status(500).json({ error: 'Failed to create program. Please try again later.' })
  }
}

/**
 * Retrieves all programs.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {ProgramRepository} programRepository - The program repository instance.
 * @returns {void}
 */
const getAllPrograms = async (req, res, programRepository) => {
  try {
      // Check if programs are cached in Redis
    const cachedPrograms = await redisClient.get(`programs`)

    if (cachedPrograms) {
      try {
         // If cached, parse and return programs
        const programs = JSON.parse(cachedPrograms)
        return res.status(200).json({ programs })
      } catch (error) {
        // Handle parsing error
        console.error('Error parsing cached programs:', error)
        res.status(500).json({ error: 'Error retrieving programs from Redis' })
        return
      }
    }
    // Retrieve all programs from the database
    const programs = await programRepository.getAllPrograms()
 
    // Cache programs in Redis
    await redisClient.SET("programs", JSON.stringify(programs), {EX: DEFAULT_EXP})
   
    // Respond with the list of programs
    res.status(200).json({ programs })
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error fetching programs:', error)
    res.status(500).json({ error: 'Failed to fetch programs. Please try again later.' })
  }
}

/**
 * Retrieves programs within a department.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {ProgramRepository} programRepository - The program repository instance.
 * @param {DepartmentRepository} departmentRepository - The department repository instance.
 * @returns {void}
 */
const getDepartmentPrograms = async (req, res, programRepository, departmentRepository) => {
  // Extracts department ID from request parameteres
  const { departmentID } = req.params

  try {
    // Find the department by ID
    const department = await departmentRepository.findDepartmentByID(departmentID)

    // If department not found, return an error
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
