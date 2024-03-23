import { useState, useEffect } from 'react'
import { Programs } from './Programs/Programs'
import './home.css'
import { ProfileSection } from '../../components/ProfileSection/ProfileSection'

const Home = () => {
  const [ showProfileSection, setShowProfileSection ] = useState(false)

  return (
    <>
      <div className='home-container'>
        <ProfileSection 
          showProfileSection = {showProfileSection}
          setShowProfileSection = {setShowProfileSection}
        />
        <div className='introduction-section'>
          <div className='welcome-greetings'>
            <h1>Welcome to PanpacificU's E-Library</h1>
            <h4>Explore a world of knowledge with PanpacificU's E-Library – your gateway to academic excellence.</h4>
          </div>
          <dotlottie-player src="https://lottie.host/c7b8849d-1b44-4cb0-a68f-6874fbafe0f3/AJYxlq4Zs0.json" background="transparent" speed="1" style={{ width: "300px", height: "200px" }} loop autoplay></dotlottie-player>
        </div>
        <div className='main-section'>
          <div className='library-section'>
            <div className='programs-div'>
              <Programs />
            </div>
          </div> 
        </div>
      </div>
    </>
  )
}

export default Home