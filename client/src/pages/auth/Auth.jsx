import React, { useState, useEffect } from 'react'
import ToggleDarkMode from '../../components/ToggleDarkMode'
import './styles.css'
import { Login } from './Login'
import { Register } from './Register'

const Authentication = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('isDarkMode')
    return storedDarkMode ? JSON.parse(storedDarkMode) : false
  })
  
  const [formType, setFormType] = useState(false)
  
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])
  
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }
  
  const toggleFormType = () => {
    setFormType((prev) => !prev)
  }
  
  const navigateToTeam = () => {
    // Add navigation logic here
    window.location.href = '/team';
  }
  
  return (
    <div className={`auth-body ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className={`grains-overlay ${isDarkMode ? 'dark-mode' : ''}`}></div>
      <div className={`auth-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className={`left-side ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="logo-part">
            <img className="logo-image" src="/PU_ELIB_LOGO3.webp" alt="E-LIB Logo" />
          </div>
          <div className="form-part">
            {/* basta */}
            {formType ? <Register /> : <Login />}
            <div className="create-account">
              {!formType && <p>Don't have an account yet?</p>}
              <button onClick={toggleFormType}>
                {formType ? 'Go to login page' : 'Create an account'}
              </button>
              <button className="meet-team-btn" onClick={navigateToTeam}>
                Meet Our Team
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* checkbox toggle dark mode functionality part */}
      <ToggleDarkMode isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  )
}

export default Authentication