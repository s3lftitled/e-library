import { useState, useEffect } from 'react'
import './styles.css'
import { Login } from './Login'
import { Register } from './Register'


const Authentication = () => {
  const [form, setForm] = useState(false)
  
  return (
    <div className="auth-body">
      <div className="grains-overlay"></div>
      <div className="auth-container">
        <div className="left-side">
        <div className="logo-part">
          <img src="PU_ELIB_LOGO3.webp" alt="PU Library Logo" className="logo-image "></img>
          </div>
          <div className="form-part">
          {form ? (
            <Register/>
          ) : (
            <Login/>
          )}
          <div className='create-account'>
            {!form && (
              <p>
                Don't have an account yet?
              </p>
            )}
            <button 
              className='buttons'
              onClick={() => {
                setForm(!form)
              }}
            >
              { form ? 
                'Go to login page' 
                  : 
                'Create an account'
              }
            </button>
          </div> </div>
        </div>
      </div>
    </div>
  )
}

export default Authentication