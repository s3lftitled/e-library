import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from 'react-router-dom';
import api from "../../../utils/api"

export const Login = () => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const  [_, setCookies ] = useCookies(['access_token'])
  const navigate = useNavigate()
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
      const result = await api.post('users/login', 
      { email, password}
      )

      setCookies('access_token', result.data.token)
      localStorage.setItem('userID', result.data.userID)
      alert('Logged in succesfully')
      navigate('/home')
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.msg)
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
            type='text'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </form>
        <button onClick={handleSubmission}>Login</button>
    </>
  )
}