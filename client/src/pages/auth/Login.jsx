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
      if (err.response) {
        const { data } = err.response;
        if (data.error) {
          if (data.error === 'Please verify your email first') {
            alert(data.error);
            navigate(`/verify/${email}`);
          } else {
            alert(data.error);
          }
        } else {
          alert('An error occurred. Please try again.');
        }
      } else {
        alert('An error occurred. Please try again.');
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
