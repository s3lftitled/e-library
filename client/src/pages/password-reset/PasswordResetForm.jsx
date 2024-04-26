import { useState } from 'react'
import api from '../../../utils/api'
import { useNavigate, useParams } from 'react-router-dom'
import './PasswordResetForm.css'

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', 'password-confirmation': '' })
  const { resetToken } = useParams()
  const navigate = useNavigate()

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      console.log(formData.password)
      const response = await api.put(`auth/reset-password/${resetToken}`, {
        newPassword: formData.password,
        newPasswordConfirmation: formData['password-confirmation']
      })

      console.log(response)

      if (response.status === 200) {
        alert(response.data.message)
        navigate('/auth')
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error)
      }
    }
  }

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    try {
      formattedValue = JSON.parse(value)
    } catch (error) {
      // Ignore parsing errors
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }))
  }

  return (
    <div className='form-root'>
      <div className='logo-part'>
        <img src='/PU_ELIB_LOGO3.webp' alt='PU Library Logo' className='logo-image' />
      </div>
      <div className='form-container'>
        <div className='logo-container'>Forgot Password</div>

        <form className='form' onSubmit={handleSubmission}>
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input onChange={handleFieldChange} type='password' id='password' name='password' placeholder='Enter new password' required />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Confirm Password</label>
            <input onChange={handleFieldChange} type='password' id='password-confirmation' name='password-confirmation' placeholder='Confirm new password' required />
          </div>

          <button className='form-submit-btn' type='submit'>
            Change Password
          </button>
        </form>

        <p className='signup-link'>
          Don't have an account?
          <a href='/auth' className='signup-link link'>
            Sign up now
          </a>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
