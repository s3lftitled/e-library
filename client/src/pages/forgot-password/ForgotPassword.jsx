import { useState } from 'react'
import api from '../../../utils/api'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const [ email, setEmail ] = useState('')

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('auth/forgot-password', { email })

      console.log(response)

      if(response.status === 200) {
        alert(response.data.message)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.log(err.response.data.msg)
      }
    }
  }
  return (
    <div className='form-root'>
      <div className="logo-part">
          <img
              src='PU_ELIB_LOGO3.webp'
              alt="PU Library Logo"
              className="logo-image"
            />
          </div>
      <div className="form-container">
        <div className="logo-container">
          Forgot Password
        </div>

        <form className="form" onSubmit={handleSubmission}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input onChange={(e) => setEmail(e.target.value)} type="text" id="email" name="email" placeholder="Enter your email" required />
          </div>

          <button className="form-submit-btn" type="submit">Send Email</button>
        </form>

        <p className="signup-link">
          Don't have an account?
          <a href="/auth" className="signup-link link"> Sign up now</a>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword