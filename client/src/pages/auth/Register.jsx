import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SuccessAlert from '../../components/Alerts/SuccessAlert/SuccessAlerts'
import ErrorAlert from '../../components/Alerts/ErrorAlert/ErrorAlerts'
import api from '../../../utils/api'

export const Register = () => {
  const [registrationData, setRegistrationData] = useState({
    selectedRole: '',
    selectedDepartment: '',
    selectedProgram:''
  })
  const [uiState, setUiState] = useState({
    isButtonDisabled: false,
    loginText: '',
    currentIndex: 0,
    loginTextOrigin: 'Register'
  })
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])

  const [ successMsg, setSuccessMsg ] = useState(null)
  const [ errorMsg, setErrorMsg ] = useState(null)

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
        response = await api.post('auth/student-registration', {
          email: registrationData.email,
          password: registrationData.password,
          passwordConfirmation: registrationData.passwordConfirmation,
          chosenDepartment: registrationData.selectedDepartment,
          chosenRole: registrationData.selectedRole,
          chosenProgram: registrationData.selectedProgram
        })
      } else {
        response = await api.post('auth/staff-registration', {
          email: registrationData.email,
          password: registrationData.password,
          passwordConfirmation: registrationData.passwordConfirmation,
          chosenRole: registrationData.selectedRole
        })
      }
      if (response.status === 200) {
        alert(response.data.msg)
        console.log(response.data.msg)
        navigate(`/verify/${registrationData.email}`)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error)
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

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
  
    try {
      formattedValue = JSON.parse(value)
    } catch (error) {
      // Ignore parsing errors
    }
  
    setRegistrationData(prevData => ({
      ...prevData,
      [name]: formattedValue
    }))
  }

  return (
    <>
      { successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg(null)} /> }
      { errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}
      <h1>{uiState.loginText}</h1>
      <form>
        <input
          type='text'
          name='email'
          placeholder='Enter your Panpacific Email'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder= 'Password (e.g., Student123_)'
          name='password'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='Confirm Password'
          name='passwordConfirmation'
          onChange={handleChange}
        />
        <select
          name='selectedRole'
          onChange={handleChange}
          className="role-selection"
          value={registrationData.selectedRole}
        >
          <option value='' disabled>Select your role</option>
          <option>Student</option>
          <option>Staff</option>
          <option>Librarian</option>
        </select>
        {registrationData.selectedRole === 'Student' && (
          <select
            name='selectedDepartment'
            onChange={handleChange}
            className="department-selection"
            value={registrationData.selectedDepartment}
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
        {registrationData.selectedDepartment && registrationData.selectedRole === 'Student' && (
          <select
            name='selectedProgram'
            onChange={handleChange}
            className="program-selection"
            value={registrationData.selectedProgram}
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
