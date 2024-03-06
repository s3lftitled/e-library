import { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { Programs } from './Programs'
import './home.css'
import { ProfileSection } from '../../components/ProfileSection';

export const Home = () => {

  const [ showProfileSection, setShowProfileSection ] = useState(false)
  const [cookies] = useCookies(['access_token'])
  const accessToken = cookies.access_token

  useEffect(() => {
    if (!accessToken) {
      window.location.href = '/auth'
    }
  }, [accessToken])

  return (
    <>
      <div className='home-container'>
        <ProfileSection 
          showProfileSection={showProfileSection}
          setShowProfileSection={setShowProfileSection}
        />
<<<<<<< HEAD
        <div className='introduction-section h1'>
          <h1>Welcome to PanpacificU's E-Library</h1>
=======
        <div className='introduction-section'>
          <div className='welcome-greetings'>
            <h1>Welcome to PanpacificU's E-Library</h1>
            <h4>Explore a world of knowledge with PanpacificU's E-Library – your gateway to academic excellence.</h4>
          </div>
          <dotlottie-player src="https://lottie.host/c7b8849d-1b44-4cb0-a68f-6874fbafe0f3/AJYxlq4Zs0.json" background="transparent" speed="1" style={{ width: "300px", height: "200px" }} loop autoplay></dotlottie-player>
>>>>>>> 11df758610e2f5265c1c380b792286b7df2cafb3
        </div>
        <div className='main-section'>
          <div className='library-section' style={{ maxHeight: '725px', overflowY: 'auto' }}>
            <h2><u>Library Section</u></h2>
            <div className='programs-div'>
              <Programs />
            </div>
          </div> 
        </div>
      </div>
    </>
  );
};