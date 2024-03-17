import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../../context/AuthContext";
import api from "../../../utils/api"

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const [loginText, setLoginText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loginTextOrigin, setLoginTextOrigin] = useState('Login')

  useEffect(() => {
    if (currentIndex < loginTextOrigin.length) {
      const timeout = setTimeout(() => {
        setLoginText((prevtext) => prevtext + loginTextOrigin[currentIndex])
        setCurrentIndex((prevIndex) => prevIndex + 1)
      }, 200);
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, loginTextOrigin])

  const handleSubmission = async () => {
    try {
      const result = await api.post('users/login', { email, password }, { withCredentials: true }) 
      
        const { userID, role, accessToken } = result.data

        login({ accessToken })
  
        localStorage.setItem('userID', userID)
        localStorage.setItem('userRole', role)

        alert('Logged in successfully')
        navigate('/welcome')
    } catch (err) {
      console.error(err);
      if (err.response?.data?.msg === 'Please verify your email first') {
        alert(err.response.data.msg)
        navigate(`/verify/${email}`)
      } else if (err.response?.status === 429) {
        alert(err.response.data.error)
      }
       else {
        alert(err.response?.data?.msg || 'An error occurred')
      }
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
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </form>
      <button onClick={handleSubmission}>Login</button>
    </>
  )
}
