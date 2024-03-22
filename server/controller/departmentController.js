
const createDepartment = async (req, res, departmentRepository) => {
  const { title } = req.body

  try {

    // Validate input data
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required and must be a string' });
    }

    const existingDepartment = await departmentRepository.findExistingDepartment(title)

    if (existingDepartment) {
      return res.status(400).json({ error: 'Department already exists '})
    }

    const department = departmentRepository.createDepartment(title)

    res.status(201).json({ department, msg: 'Department has been created succesfully' })
  } catch (error) {
    console.error('Error creating department:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const addProgramToDept = async (req, res, departmentRepository, programRepository) => {
  const { departmentID, programID } = req.params

  try {
    if (!programID || !departmentID) {
      return res.status(400).json({ error: 'Please provide both departmentID and programID' })
    }

    const program = await programRepository.findProgramById(programID)
    const department = await departmentRepository.findDepartmentById(departmentID)

    if (!program || !department) {
      return res.status(404).json({ error: 'Program or Department is not found' })
    }

    const existingProgram = await departmentRepository.findExistingProgramInADept(program._id)

    if (existingProgram) {
      return res.status(400).json({ error: 'Program is already in the department'})
    }

    department.programs.push(program)
    await departmentRepository.updateDepartmentPrograms(departmentID, department.programs)

    res.status(201).json({ msg: `${program.title} has been succesfully added to ${department.title}`})
  } catch (error) {
    console.error('Error adding program to department:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getAllDepartments = async (req, res, departmentRepository) => {
  try {
    // Retrieve all programs from the database
    const department = await departmentRepository.getAllDepartments()

    // Respond with the list of programs
    res.status(200).json({ department })
    console.log({ department })
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