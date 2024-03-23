import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../utils/api'

export const Register = () => {
  const [registrationData, setRegistrationData] = useState({
    email: '',
    password: '',
    passwordConfirmation: '',
    selectedRole: '',
    selectedDepartment: '',
    selectedProgram: ''
  })

  const [uiState, setUiState] = useState({
    isButtonDisabled: false,
    loginText: '',
    currentIndex: 0,
    loginTextOrigin: 'Register'
  })

  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    console.log('register component rerendered')
    const { currentIndex, loginTextOrigin, selectedDepartment } = uiState
    if (currentIndex < loginTextOrigin.length) {
      const timeout = setTimeout(() => {
        setUiState(prevUiState => ({
          ...prevUiState,
          loginText: prevUiState.loginText + loginTextOrigin[currentIndex],
          currentIndex: prevUiState.currentIndex + 1
        }))
      }, 200)
      return () => clearTimeout(timeout)
    }
    fetchDepartments()
    if (registrationData.selectedDepartment) {
      console.log(registrationData.selectedDepartment)
      fetchPrograms()
    }
  }, [uiState.currentIndex, uiState.loginTextOrigin, registrationData.selectedDepartment])

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/department/get-departments')
      if (response.status === 200) {
        setDepartments(response.data.department)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.log(err.response.data.msg)
      }
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await api.get(`/programs/get-department-programs/${registrationData.selectedDepartment}`)
      if (response.status === 200) {
        setPrograms(response.data.programs)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.log(err.response.data.msg)
      }
    }
  }

  const handleSubmission = async () => {
    try {
      console.log('registration submission func has been rerendered')
      console.log(uiState.selectedDepartment)
      if (uiState.isButtonDisabled) {
        return
      }
      setUiState(prevUiState => ({
        ...prevUiState,
        isButtonDisabled: true
      }))

      let response
      if (registrationData.selectedRole === 'Student') {
        response = await api.post('users/student-registration', {
          email: registrationData.email,
          password: registrationData.password,
          passwordConfirmation: registrationData.passwordConfirmation,
          chosenDepartment: registrationData.selectedDepartment,
          chosenRole: registrationData.selectedRole,
          chosenProgram: registrationData.selectedProgram
        })
      } else {
        response = await api.post('users/staff-registration', {
          email: registrationData.email,
          password: registrationData.password,
          passwordConfirmation: registrationData.passwordConfirmation,
          chosenRole: registrationData.selectedRole
        })
      }
      if (response.status === 200) {
        alert('Registered successfully, verification code sent to your email')
        navigate(`/verify/${registrationData.email}`)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error || 'An error occurred. Please try again.')
      } else {
        alert('An error occurred. Please try again.')
      }
    } finally {
      setTimeout(() => {
        setUiState(prevUiState => ({
          ...prevUiState,
          isButtonDisabled: false
        }))
      }, 3000)
    }
  }

  const handleChange = (e, field) => {
    const value = e.target.value
    setRegistrationData(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  return (
    <>
      <h2>{uiState.loginText}</h2>
      <form>
        <input
          type='text'
          placeholder='Email'
          value={registrationData.email}
          onChange={(e) => handleChange(e, 'email')}
        />
        <input
          type='password'
          placeholder='Password'
          value={registrationData.password}
          onChange={(e) => handleChange(e, 'password')}
        />
        <input
          type='password'
          placeholder='Confirm Password'
          value={registrationData.passwordConfirmation}
          onChange={(e) => handleChange(e, 'passwordConfirmation')}
        />
        <select
          value={registrationData.selectedRole}
          onChange={(e) => handleChange(e, 'selectedRole')}
          className="role-selection"
        >
          <option value='' disabled>Select your role</option>
          <option>Student</option>
          <option>Staff</option>
          <option>Librarian</option>
        </select>
        {registrationData.selectedRole === 'Student' && (
          <select
            value={registrationData.selectedDepartment}
            onChange={(e) => handleChange(e, 'selectedDepartment')}
            className="department-selection"
          >
            <option value='' disabled>Select your department</option>
            {departments.length > 0 &&
              departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.title}
                </option>
              ))}
          </select>
        )}
        {registrationData.selectedDepartment && (
          <select
            value={registrationData.selectedProgram}
            onChange={(e) => handleChange(e, 'selectedProgram')}
            className="program-selection"
          >
            <option value='' disabled>Select your Program</option>
            {programs.length > 0 &&
              programs.map((prog) => (
                <option key={prog._id} value={prog._id}>
                  {prog.title}
                </option>
              ))}
          </select>
        )}
      </form>
      <button onClick={handleSubmission} disabled={uiState.isButtonDisabled}>Register</button>
    </>
  )
}
  
