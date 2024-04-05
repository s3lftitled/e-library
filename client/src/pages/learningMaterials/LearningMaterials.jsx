import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ProfileSection } from "../../components/ProfileSection/ProfileSection"
import { MdBookmarkBorder, MdBookmark } from "react-icons/md";
import Spinner from "../../components/Spinner/Spinner"
import privateAxios from "../../../utils/api"
import toggleBookmark from "../../../utils/toggleBookmark";
import "./LearningMaterials.css"

const LearningMaterials = () => {
  const [learningMaterials, setLearningMaterials] = useState([])
  const [ showProfileSection, setShowProfileSection ] = useState(false)
  const [loading, setLoading] = useState(true)
  const { programID, programTitle, courseID, courseTitle,  } = useParams()
  const [bookshelf, setBookshelf] = useState([])
  const userID = localStorage.getItem("userID")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLearningMaterials = async () => {
      try {
        const response = await privateAxios.get(`/learning-materials/courses/${courseID}/${userID}`, {withCredentials: true} )
        const materials = response.data.learningMaterials.map(material => {
          const materialID = material._id
          material.isBookmarked = bookshelf.some(bookmark => bookmark._id === materialID)
          return material
        })
        setLearningMaterials(materials)
        setLoading(false)
        console.log(learningMaterials)
      } catch (err) {
        setLoading(false)
        console.log(err)
      }
    }
    if (bookshelf.length > 0) {
      fetchLearningMaterials()
    }
  }, [courseID, bookshelf])

  const navigateBackToCourses = () => {
    navigate(`/courses/${programID}/${programTitle}`)
  }

  const handlePdfClick = (materialID) => {
    navigate(`/view-material/${materialID}`)
  }

  const addToBookShelf = async (materialID) => {
    try {
      const response = await privateAxios.post(`/users/${userID}/add-to-bookmark/${materialID}`, {}, { withCredentials: true })
      setBookshelf([...bookshelf, materialID])
      alert(response.data.msg)
    } catch (err) {
      console.error('Error:', err) // Log the error to console
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.error || 'An error occurred. Please try again.'
        if (errorMessage === 'Material is already on your bookshelf') {
          alert(errorMessage)
        } else {
          alert(errorMessage)
        }
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }  

 useEffect(() => {
  const userBookmarks = async () => {
    try {
      const response = await privateAxios.get(`/users/${userID}/book-shelf`, { withCredentials: true })
      console.log(response.data.bookshelf)
      setBookshelf(response.data.bookshelf)
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error || 'An error occurred. Please try again.')
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }

  userBookmarks()
}, [userID])
  

  if (loading) {
    return <Spinner text="" />
  }

  return (
    <div className="learning-materials-container"> 
      <header>
        <ProfileSection 
            showProfileSection = {showProfileSection}
            setShowProfileSection = {setShowProfileSection}
          />
        <div className="header-content">
          <ion-icon name="arrow-back" onClick={() => navigateBackToCourses()}></ion-icon>
          <h1>{ courseTitle ? courseTitle : 'Learning Materials' }</h1>
        </div> 
        <dotlottie-player src="https://lottie.host/c7b8849d-1b44-4cb0-a68f-6874fbafe0f3/AJYxlq4Zs0.json" background="transparent" speed="1" style={{ width: "110px", height: "auto", margin: "10px" }} loop autoplay></dotlottie-player>
      </header>
      <div className="materials-container">
        {learningMaterials.length > 0 ? (
          learningMaterials.map((material) => (
            <div key={material._id} className="material">
               {material.isBookmarked ? (
                <MdBookmark className="bookmark-icon bookmarked" onClick={() => toggleBookmark(material._id, addToBookShelf, bookshelf, setBookshelf)} />
              ) : (
                <MdBookmarkBorder className="bookmark-icon" onClick={() => toggleBookmark(material._id, addToBookShelf, bookshelf, setBookshelf)} />
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
    </div>
  )
}

export default LearningMaterials
