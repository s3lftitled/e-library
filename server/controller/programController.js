const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')
const { getDownloadURL, getStorage, ref } = require('firebase/storage')
const { app } = require('../config/firebase.config')

const storage = getStorage(app)

/**
 * Clears cached programs for all users from Redis.
 * 
 * @returns {void}
 */
const clearAllProgramsCache = async () => {
  try {
    const keys = await redisClient.keys('programs:*')
    if (keys.length > 0) {
      await redisClient.del(keys)
      await redisClient.del('programs')
    }
    console.log('All programs cache cleared')
  } catch (error) {
    throw new Error(`Error clearing courses cache: ${error.message}`)
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
    clearAllProgramsCache()

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

    // Sort programs by title
    programs.sort((a, b) => (a.title > b.title) ? 1 : (a.title < b.title) ? -1 : 0)
 
    // Cache programs in Redis
    await redisClient.set("programs", JSON.stringify(programs), "EX", DEFAULT_EXP)
   
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

const getProgramImageURL = async (req, res, programRepository) => {
  // Extract material ID and user ID from request parameters
  const { programID, userID } = req.params

  try {
    // Check if the material details are cached in Redis
    const cachedProgramImage = await redisClient.get(`image:${userID}:${programID}`)

    // If cached materials exist, parse and return them
    if (cachedProgramImage) {
      try {
        const downloadUrl = JSON.parse(cachedProgramImage)
        return res.status(200).json({ downloadUrl })
      } catch (err) {
        // Handle parsing error if unable to parse cached materials
        console.error('Error parsing cached materials:', err)
        res.status(500).json({ error: 'Error retrieving materials from Redis' })
        return
      }
    }

    // Check if material ID is provided
    if (!programID) {
      return res.status(400).json({ error: 'program ID is not found' })
    }

    // Find the learning material in MongoDB
    const program = await programRepository.findProgramByID(programID)

    // If material not found, return error
    if (!program) {
      return res.status(404).json({ error: 'Program not found' })
    }

    if (!program.imageURL) {
      return res.status(200).json({ msg: 'Program currently dont have an image url'})
    }
    // Create a non-root reference using child
    const storageRef = ref(storage, program.imageURL)

    // Get the download URL of the file from Firebase Storage
    const downloadUrl = await getDownloadURL(storageRef)
    
    // Cache the material details in Redis
    await redisClient.set(`image:${userID}:${programID}`, JSON.stringify(downloadUrl), "EX", DEFAULT_EXP)
    
    // Respond with the downloadUrl
    res.status(200).json({ downloadUrl })
  } catch (error) {
    // Handle any errors and respond with an error message
    console.error('Error retrieving material:', error)
    res.status(500).json({ error: 'Failed to retrieve material. Please try again later.' })
  }
}

const changeProgramTitle = async (req, res, programRepository) => {
  const { newProgramName } = req.body
  const { programID } = req.params
  try {
    if (!programID) {
      return res.status(400).json({ error: 'Program ID is required' });
    }

    const program = await programRepository.findProgramByID(programID)

    if (!program) {
      res.status(404).json({ error: 'Program not found'})
    }

    if (!newProgramName || typeof newProgramName !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid new name for the program' });
    }

    if (!newProgramName) {
      res.status(404).json({ error: 'Please provide a new name for the program'})
    }

    await programRepository.updateProgramTitle(programID, newProgramName)

    clearAllProgramsCache()

    res.status(200).json({ msg: `Program name changed succesfully: ${program.title}`})

  } catch (error) {
    // Handle any errors and respond with an error message
    console.error('Error changing program name:', error)
    res.status(500).json({ error: 'Failed to change program name. Please try again later.' })
  }
}
 
module.exports = { 
  createProgram,
  getAllPrograms,
  getDepartmentPrograms,
  getProgramImageURL,
  changeProgramTitle
}
