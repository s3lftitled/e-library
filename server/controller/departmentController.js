/**
 * Create a new department.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} departmentRepository - The repository for department operations.
 * @returns {Object} - JSON response indicating success or failure.
 */
const createDepartment = async (req, res, departmentRepository) => {
  const { title } = req.body

  try {

    // Validate input data
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }

    // Check if the department already exists
    const existingDepartment = await departmentRepository.findExistingDepartment(title)

    // If department already exists respond with status 400 
    if (existingDepartment) {
      return res.status(400).json({ error: 'Department already exists '})
    }

    // Create a new department
    const department = departmentRepository.createDepartment(title)

     // Respond with the created department
    res.status(201).json({ department, msg: 'Department has been created succesfully' })
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error creating department:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

/**
 * Add a program to a department.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} departmentRepository - The repository for department operations.
 * @param {Object} programRepository - The repository for program operations.
 * @returns {Object} - JSON response indicating success or failure.
 */
const addProgramToDept = async (req, res, departmentRepository, programRepository) => {
  const { departmentID, programID } = req.params

  try {
     // Check if both departmentID and programID are provided
    if (!programID || !departmentID) {
      return res.status(400).json({ error: 'Please provide both departmentID and programID' })
    }

    // Find the program and department
    const program = await programRepository.findProgramById(programID)
    const department = await departmentRepository.findDepartmentById(departmentID)

     // If program or department not found, return an error
    if (!program || !department) {
      return res.status(404).json({ error: 'Program or Department is not found' })
    }

    // Check if the program already exists in the department
    const existingProgram = await departmentRepository.findExistingProgramInADept(program._id)

    // If program already exists return an error
    if (existingProgram) {
      return res.status(400).json({ error: 'Program is already in the department'})
    }

    // Add the program to the department's list of programs
    department.programs.push(program)
    await departmentRepository.updateDepartmentPrograms(departmentID, department.programs)

    // Respond with success message
    res.status(201).json({ msg: `${program.title} has been succesfully added to ${department.title}`})
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error adding program to department:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

/**
 * Get all departments.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} departmentRepository - The repository for department operations.
 * @returns {Object} - JSON response containing the list of departments.
 */
const getAllDepartments = async (req, res, departmentRepository) => {
  try {
    // Retrieve all programs from the database
    const department = await departmentRepository.getAllDepartments()

    // Respond with the list of programs
    res.status(200).json({ department })
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error retrieving departments:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = {
  createDepartment,
  addProgramToDept,
  getAllDepartments
}