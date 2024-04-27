import { useState } from 'react'
import api from '../../../utils/api'
import SuccessAlert from "../../components/Alerts/SuccessAlert/SuccessAlerts"
import ErrorAlert from "../../components/Alerts/ErrorAlert/ErrorAlerts"
import './ForgotPassword.css'

const ForgotPassword = () => {
  const [ email, setEmail ] = useState('')
  const [ successMsg, setSuccessMsg ] = useState(null)
  const [ errorMsg, setErrorMsg ] = useState(null)

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('auth/forgot-password', { email })

      console.log(response)

      if(response.status === 200) {
        setSuccessMsg(response.data.message)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error)
      }
    }
  }
  return (
    <>
      { successMsg && <SuccessAlert message={successMsg} onClose={() => setSuccessMsg(null)} /> }
      { errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg(null)} />}
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
            <a href="/auth" className="signup-link link">Go back to Login</a>
          </p>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword