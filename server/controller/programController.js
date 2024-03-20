const { Program, Department } = require('../models/e-book')
const User = require('../models/user')
const { redisClient, DEFAULT_EXP } = require('../utils/redisClient')

const clearAllProgramsCache = async () => {
  try {
    const allUserIds = await User.find({}, '_id');

    for (const userIdObj of allUserIds) {
      const userId = userIdObj._id.toString();
      await redisClient.del(`programs:${userId}`)
      await redisClient.del("programs")
    }
  } catch (error) {
    console.error('Error clearing programs cache for all users:', error);
  }
}

const createProgram =  async (req, res) => {
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

    await clearAllProgramsCache()

    // Respond with the created program
    res.status(201).json(program)
  } catch (error) {
      // Handle errors and respond with an error message
      res.status(500).json({ error: error.message })
  }
}

const getAllPrograms = async (req, res) => {
  try {
    const cachedPrograms = await redisClient.get(`programs`)

    if (cachedPrograms) {
      try {
        const programs = JSON.parse(cachedPrograms)
        res.status(200).json({ programs })
      } catch (err) {
        console.error('Error parsing cached programs:', err)
        res.status(500).json({ msg: 'Error retrieving programs from Redis' })
        return
      }
    }
    // Retrieve all programs from the database
    const programs = await Program.find({})

    await redisClient.SET("programs", JSON.stringify(programs), {EX: DEFAULT_EXP})
    // Respond with the list of programs
    res.status(200).json({ programs })
  } catch (error) {
    // Handle errors and respond with an error message
    res.status(500).json({ error: error.message })
  }
}

const getDepartmentPrograms = async (req, res) => {
  const { departmentID } = req.params

  try {
    // Find the department by ID
    const department = await Department.findById(departmentID)

    if (!department) {
      return res.status(404).json({ msg: 'Department not found' })
    }

    // Retrieve the details of the programs within the department
    const programIds = department.programs;
    const programs = await Program.find({ _id: { $in: programIds } })

    // Respond with the list of programs
    res.status(200).json({ programs })
  } catch (error) {
    // Handle errors and respond with an error message
    res.status(500).json({ error: error.message })
  }
}
 
module.exports = { 
  createProgram,
  getAllPrograms,
  getDepartmentPrograms
}
