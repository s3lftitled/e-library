import React, { useState, useEffect } from "react"
import useUserData from "../../../hooks/useUserData"
import { useNavigate } from "react-router-dom"
import api from "../../../utils/api"
import './ProfileSection.css'

export const ProfileSection = ({ showProfileSection, setShowProfileSection }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [base64Image, setBase64Image] = useState('')
  const { user } = useUserData()
  const userID = localStorage.getItem("userID")
  const navigate = useNavigate()

  const handleSubmission = async (e) => {
    e.preventDefault()

    try {
      const response = await api.post(`/users/profile/upload-image/${userID}`, {
        base64Image: base64Image
      }, { withCredentials: true })

      if (response.status === 200) {
        alert('Profile picture has been uploaded successfully. Refresh the page to see changes.')
        setIsUploading(false)
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err)
    }
  }

  const convertToBase64 = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => {
        console.log(reader.result)
        setBase64Image(reader.result)
      }

      reader.onerror = (error) => {
        console.error("Error reading file:", error)
      }
    }
  }

  const handleLogOut = async () => {
    try {
      const response = await api.delete(`users/logout/${userID}`)

      if (response.status === 200) {
        localStorage.clear()
        navigate('/auth')
      }
    } catch (err) {
      console.error("Error logging out:", err)
    }
  }

  const navigateToDashboard = () => {
    navigate('/admin-dashboard')
  }

  return (
    <>
      {!showProfileSection ? (
        <div
          className='user-icon'
          onClick={() => setShowProfileSection(true)}
        >
          <img className="user-icon" src={ user?.profilePic || "pfp.avif"} alt="user-profile"/>
        </div>
      ) : (
        <div className='profile-section'>
            <div className="user-details">
              <img
                src={ user?.profilePic || "pfp.avif"}
                alt="user's profile picture"
                className="user-pic"
              />
              {isUploading ? (
                <form className="upload-pic-form" onSubmit={handleSubmission}>
                  <input
                    type="file"
                    accept=".jpeg, .jpg, .png"
                    onChange={convertToBase64}
                  />
                  <div className="upload-btn-choices">
                    <button type="submit">Upload</button>
                    <button onClick={() => setIsUploading(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button
                  className="change-pic-btn"
                  onClick={() => setIsUploading(true)}
                >
                  Change Profile Picture
                </button>
              )}

              <h2 key={user?._id} className="user-greeting">
                Hello! {user?.username} 👋
              </h2>
              <h3 className="user-email">{user?.email}</h3>
              <h4 className="user-role">{user?.role}</h4>
              { user.departmentName && <h4 className="user-department"><p>Department:</p> {user?.departmentName}</h4>}
              { user.programName && <h4 className="user-department"><p>Program:</p> {user?.programName}</h4>}
              <div className="separator-underline"></div>

              <div className="user-content-section">
                <h2>NOTES</h2>
                <h2>BOOKSHELF</h2>
                { user.role === 'Librarian' && <h2 onClick={() => navigateToDashboard()}>DASHBOARD</h2>}
              </div>

              <div className="separator-underline"></div>
              
              <div className="log-out-section">
                <a>Change password?</a>
                <button onClick={() => handleLogOut()}>LOG OUT</button>
              </div>
            </div>
    
          <button
            className='hide-profile-section'
            onClick={() => setShowProfileSection(false)}
          >
            x
          </button>
        </div>
      )}
    </>
  )
}

