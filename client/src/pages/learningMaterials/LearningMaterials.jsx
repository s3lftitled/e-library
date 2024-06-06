import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ProfileSection } from "../../components/ProfileSection/ProfileSection"
import { MdBookmarkBorder, MdBookmark } from "react-icons/md"
import FloatingButton from "../../components/FloatingButton/FloatingButton"
import Spinner from "../../components/Spinner/Spinner"
import Form from "../../components/UploadForm/Form"
import usePrivateApi from "../../../hooks/usePrivateApi"
import "./LearningMaterials.css"
import ToggleDarkMode from "../../components/ToggleDarkMode"

const LearningMaterials = () => {
  const [learningMaterials, setLearningMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfileSection, setShowProfileSection] = useState(false)
  const { programID, programTitle, courseID, courseTitle } = useParams()
  const [bookshelf, setBookshelf] = useState([])
  const [showForm, setShowForm] = useState(false)
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
    // Fetch user's bookmarks initially
    fetchBookshelf()
  }, [userID])

  useEffect(() => {
    // Fetch learning materials initially
    fetchLearningMaterials()
  }, [courseID, bookshelf])

  const fetchLearningMaterials = async () => {
    try {
      const response = await privateAxios.get(`/learning-materials/courses/${courseID}/${userID}`, { withCredentials: true })
      const materials = response.data.learningMaterials.map(material => {
        const materialID = material._id
        material.isBookmarked = bookshelf.some(book => book._id === materialID)
        return material
      })
      setLearningMaterials(materials)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('Error fetching learning materials:', err)
    }
  }

  const fetchBookshelf = async () => {
    try {
      const response = await privateAxios.get(`/users/${userID}/book-shelf`, { withCredentials: true })
      setBookshelf(response.data.bookshelf)
    } catch (err) {
      console.error('Error fetching bookshelf:', err)
    }
  }

  const navigateBackToCourses = () => {
    navigate(`/courses/${programID}/${programTitle}`)
  }

  const handlePdfClick = (materialID) => {
    navigate(`/view-material/${materialID}`)
  }

  const openForm = () => {
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
  }

  const addToBookShelf = async (materialID) => {
    try {
      const response = await privateAxios.post(`/users/${userID}/add-to-bookmark/${materialID}`, {}, { withCredentials: true })
     
      if (response.status === 200) {
        setBookshelf(prevBookshelf => [...prevBookshelf, { _id: materialID }])
        setLearningMaterials(prevMaterials => {
          return prevMaterials.map(material => {
            if (material._id === materialID) {
              return { ...material, isBookmarked: true }
            }
            return material
          })
        })
      }
    } catch (err) {
      if (err.response) {
        console.log(err.response)
        alert(err.response)
      }
    } 
  }

  const deleteFromBookshelf = async (materialID) => {
    try {
      const response = await privateAxios.delete(`/users/${userID}/delete-from-bookshelf/${materialID}`, { withCredentials: true })

      if (response.status === 200) {
        setBookshelf(prevBookshelf => prevBookshelf.filter(item => item._id !== materialID))
        setLearningMaterials(prevMaterials => {
          return prevMaterials.map(material => {
            if (material._id === materialID) {
              return { ...material, isBookmarked: false }
            }
            return material
          })
        })
      }
    } catch (err) {
      if (err.response) {
        console.log(err.response)
        alert(err.response)
      }
    }
  }

  if (loading) {
    return <Spinner text="" />
  }

  return (
    <div className="learning-materials-container"> 
      <header className={`header ${isDarkMode ? 'dark-mode': ''}`}>
        <ProfileSection 
          showProfileSection={showProfileSection}
          setShowProfileSection={setShowProfileSection}
        />
        <div className="header-content">
          <ion-icon name="arrow-back" onClick={navigateBackToCourses}></ion-icon>
          <h1>{courseTitle ? courseTitle : 'Learning Materials'}</h1>
        </div> 
        <dotlottie-player src="https://lottie.host/c7b8849d-1b44-4cb0-a68f-6874fbafe0f3/AJYxlq4Zs0.json" background="transparent" speed="1" style={{ width: "110px", height: "auto", margin: "10px" }} loop autoplay></dotlottie-player>
      </header>
      <div className="materials-container">
        {learningMaterials.length > 0 ? (
          learningMaterials.map((material) => (
            <div key={material._id} className="material">
              {material.isBookmarked ? (
                <MdBookmark
                  className="bookmark-icon bookmarked"
                  onClick={() => deleteFromBookshelf(material._id)}
                />
              ) : (
                <MdBookmarkBorder
                  className="bookmark-icon"
                  onClick={() => addToBookShelf(material._id)}
                />
              )}
              <p className="material-title">{material.title}</p>
              <p className="material-author">{material.author}</p>
              <u className="underline"></u>
              <button className="pdf-button" onClick={() => handlePdfClick(material._id)}>View PDF</button>
            </div>
          ))
        ) : (
          <p>No learning materials found</p>
        )}
      </div>
      { userRole=== 'Librarian' && <FloatingButton onClick={openForm} /> }
      {showForm && <Form onClose={closeForm} type="learning-material" ID={courseID} />}
      <ToggleDarkMode isDarkMode={isDarkMode} toggleDarkMode={handleToggleDarkMode} />
    </div>
  )
}

export default LearningMaterials