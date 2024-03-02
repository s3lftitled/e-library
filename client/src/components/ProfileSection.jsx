import { useEffect, useState } from "react"
import useUserData from "../../hooks/useUserData"
import { FaBars } from 'react-icons/fa';

export const ProfileSection = ({ showProfileSection, setShowProfileSection }) => {

  const [ isUploading, setIsUploading ] = useState(false)
  const { user } = useUserData()

  useEffect(() => {
    console.log({user})
  }, [])

  const convertToBase64 = (e) => {
    const reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      console.log(reader.result)
      setBase64Image(reader.result)
    }
    reader.onerror = () => {
      console.log('Error:', error)
    }
  }

  return (
    <>
       { !showProfileSection ? 
        <button
          className='show-profile-section'
          onClick={() => setShowProfileSection(true)}
        >
          <FaBars />
        </button>
        :
        <div className='profile-section'>
          <h2>Profile Section</h2>
          {user ? (
            <div className="user-details">
              <img src="pfp.avif" alt="user's profile picture" className="user-pic"></img>
                { isUploading ?
                  <form className="upload-pic-form">
                    <input
                      type="file"
                      accept=".jpeg, .jpg, .png"
                      onChange={convertToBase64}
                    />
                    <button type="submit" onClick={() => setIsUploading(false)}>Upload</button>
                  </form>
                  :
                  <button className="change-pic-btn" onClick={() => setIsUploading(true)}>Change Profile Picture</button>
                }
              <h2 key={user._id} className="user-greeting">Hello! {user.username}</h2>
              <h3 className="user-email">{user.email}</h3>
              <h4 className="user-department">{user.departmentName}</h4>

              <div className="user-content-section">
                <h2>NOTES</h2>
                <h2>BOOKSHELF</h2>
              </div>
              <div className="log-out-section">
                <button>LOG OUT</button>
              </div>
            </div>
          ) : (
            <p>Loading user data...</p>
          )}
          <button
            className='hide-profile-section'
            onClick={() => setShowProfileSection(false)}
          >
            x
          </button>
        </div>
      }    
    </>
  )
}