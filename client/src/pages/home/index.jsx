import { useState, useEffect } from 'react'
import './home.css'

export const Home = () => {

  const [ showProfileSection, setShowProfileSection ] = useState(false)

  return (
    <>
      <div className='home-container'>
        <div className='introduction-section'>
          <h1>Welcome to PanpacificU's E-Library</h1>
        </div>
        <div className='main-section'>
          { showProfileSection && 
            <div className='profile-section'>
              <h2>Profile Section</h2>
              <button
                className='hide-profile-section'
                onClick={() => setShowProfileSection(false)}
              >
                x
              </button>
            </div>
          }
          <div className='library-section'>
            <h2>Library Section</h2>
          </div>
          {!showProfileSection && (
          <button
            className='show-profile-section'
            onClick={() => setShowProfileSection(true)}
          >
            click to view profile section
          </button>
        )}
        </div>
      </div>
    </>
  )
}