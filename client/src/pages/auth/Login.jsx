import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import useAuth from "../../../hooks/useAuth"
import './styles.css'
import api from "../../../utils/api"

export const Login = () => {
  const [formDatas, setFormDatas] = useState({})
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  const [loginText, setLoginText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loginTextOrigin, setLoginTextOrigin] = useState('Login')

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (currentIndex < loginTextOrigin.length) {
      const timeout = setTimeout(() => {
        setLoginText((prevtext) => prevtext + loginTextOrigin[currentIndex])
        setCurrentIndex((prevIndex) => prevIndex + 1)
      }, 200);
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, loginTextOrigin])

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
  
    try {
      formattedValue = JSON.parse(value)
    } catch (error) {
      // Ignore parsing errors
    }
  
    setFormDatas((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }))
  }

  const handleSubmission = async () => {
    try {

      const result = await api.post('auth/login', { email: formDatas.email, password: formDatas.password } , { withCredentials: true })

      const { userID, role, accessToken } = result.data

      setAuth({ accessToken })

      localStorage.setItem('userID', userID)
      localStorage.setItem('userRole', role)

      setSuccess('Logged in successfully')
      navigate('/welcome')
    } catch (err) {
      if (err.response && err.response.data.error === 'Please verify your email first') {
        setError(err.response.data.error)
        navigate(`/verify/${email}`)
      } else {
        setError(err.response.data.error)
      }
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmission()
    }
  }

  return (
    <>
      <h1>{loginText}</h1>
      <form>
        <input
          type='text'
          name='email'
          placeholder='Email'
          onChange={handleFieldChange}
        />
        <input
          type='password'
          name='password'
          placeholder='Password'
          onChange={handleFieldChange}
          onKeyPress={handleKeyPress} // event listener :) 
        />
      </form>
      <div className="msg-div">
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
      </div>
      <div className="login-options">
        <a className="forgot-password" href="/forgot-password">Forgot Password?</a>
        <img src="book_button_icon2.webp" alt="Login Icon"
          className="login_icon" onClick={handleSubmission} />
      </div>
    </>
  )
}