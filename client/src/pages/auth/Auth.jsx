import React, { useState, useEffect } from 'react'
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

  return (
    <div className={`auth-body ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className={`grains-overlay ${isDarkMode ? 'dark-mode' : ''}`}></div>
      <div className={`auth-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className={`left-side ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="logo-part">
          <img
              src={isDarkMode ? 'PU_ELIB_LOGO3Z.webp' : 'PU_ELIB_LOGO3.webp'}
              alt="PU Library Logo"
              className="logo-image"
            />
          </div>
          <div className="form-part">
            {/* basta */}
            {formType ? <Register /> : <Login />}
            <div className="create-account">
              {!formType && <p>Don't have an account yet?</p>}
              <button className="buttons" onClick={toggleFormType}>
                {formType ? 'Go to login page' : 'Create an account'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* checkbox toggle dark mode functionality part */}
      <div className="checkbox-wrapper-51">
        <input
          id="cbx-51"
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleDarkMode}
        />
        <label className="toggle" htmlFor="cbx-51">
          <span>
            <svg viewBox="0 0 10 10" height="10px" width="10px">
              <path
                d="M5,1 L5,1 C2.790861,1 1,2.790861 1,5 L1,5 C1,7.209139 2.790861,9 5,9 L5,9 C7.209139,9 9,7.209139 9,5 L9,5 C9,2.790861 7.209139,1 5,1"
              />
            </svg>
          </span>
        </label>
      </div>
    </div>
  )
}

export default Authentication