// Function to validate email format
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@panpacificu\.edu\.ph$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format. Please use your panpacific email');
  }
}

// Function to validate password format
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Password should have capital letters, numbers, and symbols');
  }
}

// Function to validate user data
const validateUserData = (userData) => {
  const { email, password, chosenRole, chosenDepartment, chosenProgram } = userData

  if (!email || !password || !chosenRole || !chosenDepartment || !chosenProgram) {
    throw new Error('Please fill in all the required fields')
  }

  if (typeof email !== 'string' || typeof password !== 'string' || typeof chosenRole !== 'string') {
    throw new Error('Invalid input data')
  }

  // Validate email format
  validateEmail(email)

  // Validate password format
  validatePassword(password)

  return true
}

module.exports = { 
  validateUserData,
  validateEmail,
  validatePassword
}
