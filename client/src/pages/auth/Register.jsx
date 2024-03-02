import { useState ,useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import api from "../../../utils/api"

export const Register = () => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ departments, setDepartments ] = useState([])
  const [ chosenDepartment, setChosenDepartment] = useState('')
  const navigate = useNavigate()
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  const [loginText, setLoginText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loginTextOrigin, setLoginTextOrigin] = useState('Register')

  useEffect(() => {
    console.log('register component rerendered')
    if (currentIndex < loginTextOrigin.length) {
      const timeout = setTimeout(() => {
        setLoginText((prevtext) => prevtext + loginTextOrigin[currentIndex])
        setCurrentIndex((prevIndex) => prevIndex + 1)
      }, 200);
      return () => clearTimeout(timeout)
    }
    fetchDepartments()
  }, [currentIndex, loginTextOrigin])

  const fetchDepartments = async() => {
    try {
      const response = await api.get('/e-library/department')
      
       if (response.status === 200) {
        setDepartments(response.data.department)
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
      if (isButtonDisabled) {
        return
      }

      setIsButtonDisabled(true);

      const result = await api.post('users/registration', { email, password, chosenDepartment })

      if(result.status === 200) {
        alert('Registered successfully, verification code sent to your email')
        navigate(`/verify/${email}`)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.msg)
      }
    } finally {
      setTimeout(() => {
        setIsButtonDisabled(false)
      }, 3000)
    }
  }

  return (
    <>
      <h2>{loginText}</h2>
        <form>
          <input 
            type='text'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type='text'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            value={chosenDepartment}
            onChange={(e) => setChosenDepartment(e.target.value)}
            className="department-selection"
          >
            <option value='' disabled>Select your department</option>
            {departments.length > 0 &&
              departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.title}
                </option>
              ))}
          </select>
        </form>
        <button onClick={handleSubmission}>Register</button>
    </>
  )
}