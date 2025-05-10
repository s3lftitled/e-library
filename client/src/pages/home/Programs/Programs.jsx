import React, { useEffect, useState } from 'react'
import usePrivateApi from '../../../../hooks/usePrivateApi'
import ProgramSearch from './ProgramSearch'
import { useNavigate } from 'react-router-dom'
import RecommendedProgram from './RecommendedProgram'
import ProgramCard from './ProgramCard'
import FloatingButton from '../../../components/FloatingButton/FloatingButton'
import Form from '../../../components/UploadForm/Form'

export const Programs = ({ isDarkMode }) => {
  const privateAxios = usePrivateApi()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ recommendedProgram: null, programs: [] })
  const userID = localStorage.getItem("userID")
  const userRole = localStorage.getItem('userRole')

  useEffect(() => {
    console.log(userID)
    console.log(userRole)
    const fetchPrograms = async () => {
      setLoading(true)
      try {
        let response
        if (userRole === 'Student') {
          response = await privateAxios.get(`/users/${userID}/programs`, userRole)
          setData({ recommendedProgram: response?.data?.response?.recommendedPrograms || null, programs: response?.data?.response?.restOfPrograms || [] })
        } else if (userRole === 'Staff' || userRole === 'Librarian') {
          response = await privateAxios.get(`/programs/get-programs`, userRole )
          setData({ programs: response?.data?.programs })
        }
        console.log(data)
      } catch (err) {
        console.log(err)
        if (err.response && err.response.status === 403) {
          console.log('Token expired. Navigating to /auth')
          navigate('/auth')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const navigateToCourses = (programID, programTitle) => {
    navigate(`/courses/${programID}/${programTitle}`)
  }

  useEffect(() => {
    const filteredResults = data.programs.filter((program) => program.title.toLowerCase().includes(searchQuery.toLowerCase()))
    setSearchResults(filteredResults)
  }, [searchQuery, data.programs])

  const handleResultClick = (result) => {
    setSearchQuery(result.title)
    setSearchResults([])
    navigateToCourses(result._id, result.title)
  }

  const openForm = () => {
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
  }

  const onRename = async (newTitle, programID) => {
    try {
      console.log(newTitle, programID)
      const response = await privateAxios.put(`programs/change-program-name/${programID}`,  { newProgramName: newTitle }, userRole)
      if (response.status === 200) {
        const updatedPrograms = data.programs.map(program => 
          program._id === programID ? {...program, title: newTitle} : program
        )
        setData({...data, programs: updatedPrograms})

        alert(response.data.msg)
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status
        const error = err.response.data.error
        
        switch (status) {
          case 400:
            alert('Bad Request: ' + error)
            break;
          case 404:
            alert('Not Found: ' + error)
            break;
          case 500:
            alert('Server Error: ' + error)
            break;
          default:
            alert('An unexpected error occurred')
        }
      } else {
        alert('Network Error: Please check your connection.')
      }
    }
  }

  return (
    <div className={`programs ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="search-div">
        <ProgramSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          handleResultClick={handleResultClick}
          isDarkMode={isDarkMode}
        />
      </div>
      
      {!loading && data.recommendedProgram && (
        <>
          <h2>For You</h2>
          <div className="recommended-programs">
            <RecommendedProgram
              program={data.recommendedProgram}
              onClick={() => navigateToCourses(data.recommendedProgram._id, data.recommendedProgram.title)}
              isDarkMode={isDarkMode}
            />
          </div>
        </>
      )}
      
      {!loading && data.recommendedProgram && <h2>Others</h2>}
      {!loading && !data.recommendedProgram && <h2>Programs</h2>}
      
      <div className="other-programs">
        {data.programs && data.programs.map((program) => (
          program._id ? ( 
            <ProgramCard
              key={program._id}
              program={program}
              onClick={() => navigateToCourses(program._id, program.title)}
              isDarkMode={isDarkMode}
              onRename={(newTitle) => onRename(newTitle, program._id)}
            />
          ) : (
            <p>Program ID not available</p> 
          )
        ))}
      </div>
      
      {userRole === 'Librarian' && <FloatingButton onClick={openForm} />}
      {showForm && <Form onClose={closeForm} type="program" programID={null} />}
    </div>
  )
}