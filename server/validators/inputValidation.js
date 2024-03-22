// Function to validate email format
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@panpacificu\.edu\.ph$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, errorMessage: 'Invalid email format. Please use your panpacific email' };
  }
  return { isValid: true }
}

// Function to validate password format
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return { isValid: false, errorMessage: 'Password should have capital letters, numbers, and symbols' };
  }
  return { isValid: true }
}

// Function to validate user data
const validateUserData = (userData) => {
  const { email, password, passwordConfirmation, chosenRole, chosenDepartment, chosenProgram } = userData

  if (!email || !password || ! passwordConfirmation || !chosenRole || !chosenDepartment || !chosenProgram) {
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
