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
    console.log('login component rerendered')
    if (currentIndex < loginTextOrigin.length) {
      const timeout = setTimeout(() => {
        setLoginText((prevtext) => prevtext + loginTextOrigin[currentIndex])
        setCurrentIndex((prevIndex) => prevIndex + 1)
      }, 200);
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, loginTextOrigin])

  const handleSubmission = async () => {
    console.log('login submission func has been rerendered')
    try {
      const result = await api.post('users/login', { email, password })
  
      console.log(result)
  
      if (result.status === 200) {
        console.log('User ID:', result.data.userID)
        console.log('User Role:', result.data.role)
  
        setCookies('access_token', result.data.token)
        localStorage.setItem('userID', result.data.userID)
        localStorage.setItem('userRole', result.data.role) 
  
        alert('Logged in successfully')
        navigate('/')
      }
    } catch (err) {
      console.log(err)
      if (err.response.data.msg === 'Please verify your email first') {
        alert(err.response.data.msg)
        navigate(`/verify/${email}`)
        console.log('Navigate to verification')
      } else {
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