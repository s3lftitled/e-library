import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../utils/api'

const VerificationCodeInput = () => {
  const [verificationCode, setVerificationCode] = useState('')
  const navigate = useNavigate()
  const { email } = useParams()

  const handleChange = (e) => {
    setVerificationCode(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('users/verify-email',
      {email, verificationCode}
      )
      alert('Email verified successfully. Please login to your account.')
      navigate('/auth')
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.error || 'An error occurred. Please try again.')
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }

  return (
    <div className="verification-container">
      <h2>Enter Verification Code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={verificationCode}
          onChange={handleChange}
          maxLength={6} 
          placeholder="Enter code"
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  )
}

export default VerificationCodeInput
