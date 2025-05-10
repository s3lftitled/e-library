import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import usePrivateApi from "../../../hooks/usePrivateApi"
import { ProfileSection } from "../../components/ProfileSection/ProfileSection"
import FloatingButton from "../../components/FloatingButton/FloatingButton"
import Spinner from "../../components/Spinner/Spinner"
import Form from "../../components/UploadForm/Form"
import ToggleDarkMode from "../../components/ToggleDarkMode"
import './courses.css'

const Courses = () => {
  const [programCourses, setProgramCourses] = useState([])
  const [programImage, setProgramImage] = useState(null)
  const [showProfileSection, setShowProfileSection] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { programID, programTitle } = useParams()
  const userID = localStorage.getItem("userID")
  const userRole = localStorage.getItem("userRole")
  const navigate = useNavigate()
  const privateAxios = usePrivateApi()

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

  useEffect(() => {
    console.log('courses loaded')
    let isMounted = true;

    const fetchProgramCourses = async () => {
      try {
        const response = await privateAxios.get(`/courses/${programID}/courses/${userID}`)
        setProgramCourses(response.data.courses)
        setLoading(false)
      } catch (err) {
        setLoading(false)
        if (err.response) {
          alert(err.response)
        }
      }
    }

    fetchProgramCourses()
    fetchProgramImage()

    return () => {
      isMounted = false
    }
  }, [programID])

  const fetchProgramImage = async () => {
    try {
      const response = await privateAxios.get(`/programs/get-image/${programID}/${userID}`)

      console.log(response.data)
      if (response.data.downloadUrl) {
        setProgramImage(response.data.downloadUrl)
      }    
    } catch (err) {
      console.log(console.error())
    }
  }

  const navigateToHome = () => {
    navigate('/')
  }

  const navigateToLearningMaterials = (courseID, courseTitle) => {
    navigate(`/learning-materials/${programID}/${programTitle}/${courseID}/${courseTitle}`)
  }

  const openForm = () => {
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
  }

  if (loading) {
    return <Spinner text="" />
  }

  return (
    <div className={`courses-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="courses-header">
        <ProfileSection 
          showProfileSection={showProfileSection}
          setShowProfileSection={setShowProfileSection}
          isDarkMode={isDarkMode}
        />
        <div className="courses-header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigateToHome()} aria-label="Go back">
              <ion-icon name="arrow-back"></ion-icon>
            </button>
            <h1 className="courses-program-title">{programTitle || 'Courses'}</h1>
          </div>
        </div> 
      </header>
      
      <main className="courses-main">
        {programCourses.length === 0 ? (
          <div className="no-courses">
            <div className="empty-state-icon">
              <ion-icon name="book-outline"></ion-icon>
            </div>
            <p>No courses found for this program.</p>
          </div> 
        ) : (
          <div className="courses-grid">
            {programCourses.map((course, index) => (
              <div 
                className="course-card" 
                key={course._id} 
                onClick={() => navigateToLearningMaterials(course._id, course.title)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >            
                <div className="card-image-container">
                  <div className="image-wrapper">
                    <img 
                      className="course-img" 
                      src={programImage || '/pu-logo-2.png'} 
                      alt={`${course.title} thumbnail`} 
                    />
                    <div className="image-overlay"></div>
                  </div>
                  <p className="attribution-text">
                    Free resources from <a href="https://free3dicon.com/" target="_blank" rel="noopener noreferrer">free3dicon.com</a>
                  </p>
                </div>         
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <div className="card-action">
                    <span className="view-course">View Course</span>
                    <ion-icon name="arrow-forward-outline"></ion-icon>
                  </div>
                </div>           
              </div>
            ))}
          </div>
        )}
      </main>
      
      {userRole === 'Librarian' && (
        <FloatingButton onClick={openForm} />
      )}
      
      {showForm && (
        <Form onClose={closeForm} type="course" ID={programID} />
      )}
      
      <ToggleDarkMode isDarkMode={isDarkMode} toggleDarkMode={handleToggleDarkMode} />
    </div>
  )
}

export default Courses