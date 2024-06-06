import { useState, useEffect } from 'react'
import { Programs } from './Programs/Programs'
import './Home.css'
import { ProfileSection } from '../../components/ProfileSection/ProfileSection'
import ToggleDarkMode from '../../components/ToggleDarkMode'

const Home = () => {
  const [showProfileSection, setShowProfileSection] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('isDarkMode')
    return storedDarkMode ? JSON.parse(storedDarkMode) : false
  })

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])
       

  const handleToggleDarkMode = () => {
    console.log("Toggle Dark Mode") // for debug
    setIsDarkMode((prev) => !prev)
  }

  return (
    <>
      <div className={`home-container ${isDarkMode ? 'dark-mode' : ''}`}> {}
        <ProfileSection 
          showProfileSection={showProfileSection}
          setShowProfileSection={setShowProfileSection} isDarkMode={isDarkMode}
        />
        <div className={`introduction-section ${isDarkMode ? 'dark-mode' : ''}`}> {}
          <div className="welcome-greetings">
            <h1>Welcome to PanpacificU's E-Library</h1>
            <h4>
              Explore a world of knowledge with PanpacificU's E-Library – your gateway to academic excellence.
            </h4>
          </div>
          <dotlottie-player
            src="https://lottie.host/c7b8849d-1b44-4cb0-a68f-6874fbafe0f3/AJYxlq4Zs0.json"
            background="transparent"
            speed="1"
            style={{ width: '200px', height: '200px' }}
            loop
            autoplay
          />
        </div>
        <div className="main-section">
          <div className="library-section">
            <div className="programs-div">
             <Programs isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>

        {/* dark mode toggle button */}
        <ToggleDarkMode isDarkMode={isDarkMode} toggleDarkMode={handleToggleDarkMode} />
      </div>
    </>
  )
}

export default Home