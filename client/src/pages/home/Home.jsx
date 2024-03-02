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
          showProfileSection = {showProfileSection}
          setShowProfileSection = {setShowProfileSection}
        />
        <div className='introduction-section'>
          <h1>Welcome to PanpacificU's E-Library</h1>
        </div>
        <div className='main-section'>
          <div className='library-section'>
            <h2>Library Section</h2>
            <div className='programs-div'>
              <Programs />
            </div>
          </div> 
        </div>
      </div>
    </>
  )
}