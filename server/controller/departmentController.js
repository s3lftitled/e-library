
const createDepartment = async (req, res, departmentRepository) => {
  const { title } = req.body

  try {
    if (!title) {
      return res.status(400).json({ msg: 'Please fill in the required fields' })
    }

    const existingDepartment = await departmentRepository.findExistingDepartment(title)

    if (existingDepartment) {
      return res.status(400).json({ msg: 'Department already exists '})
    }

    const department = departmentRepository.createDepartment(title)

    res.status(201).json({ department, msg: 'Department has been created succesfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const addProgramToDept = async (req, res, departmentRepository, programRepository) => {
  const { departmentID, programID } = req.params

  try {
    if (!programID || !departmentID) {
      return res.status(404).json({ msg: 'Please fill in the required fields' })
    }

    const program = await programRepository.findProgramById(programID)
    const department = await departmentRepository.findDepartmentById(departmentID)

    if (!program || !department) {
      return res.status(404).json({ msg: 'Program is not found' })
    }

    const existingProgram = await departmentRepository.findExistingProgramInADept(program._id)

    if (existingProgram) {
      return res.status(400).json({ msg: 'Program already in the department'})
    }

    department.programs.push(program)
    await departmentRepository.updateDepartmentPrograms(departmentID, department.programs)

    res.status(201).json({ msg: `${program.title} has been succesfully added to ${department.title}`})
  } catch (err) {
    res.status(500).json({ error: err.message })
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
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createDepartment,
  addProgramToDept,
  getAllDepartments
}