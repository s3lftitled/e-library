import { useState, useEffect } from 'react'
import './styles.css'

export const Authentication = () => {
  const [ loginText, setLoginText ] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0);
  const loginTextOrigin = 'Login'

  useEffect(() => {
    if (currentIndex < loginTextOrigin.length) {
      const timeout = setTimeout(() => {
        setLoginText((prevtext) => prevtext + loginTextOrigin[currentIndex])
        setCurrentIndex((prevIndex) => prevIndex + 1)
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex])

  return (
    <div className="auth-body">
      <div className="auth-container">
        <div className="right-side">
          <h2>PanpacificU E-Library</h2>
          <a href="https://www.freepik.com/">Designed by macrovector / Freepik</a>
        </div>
        <div className="left-side">
          <h2>{loginText}</h2>
          <form>
            <input 
              type='text'
              placeholder='Email'
            />
            <input 
              type='text'
              placeholder='Password'
            />
          </form>
          <button>Login</button>
          <p>Doesn't have an account yet?</p>
          <button>Create an account</button>
        </div>
      </div>
    </div>
  )
}