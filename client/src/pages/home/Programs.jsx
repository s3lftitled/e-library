import { useEffect, useState } from "react"
import useUserData from "../../../hooks/useUserData"
import usePrivateApi from '../../../hooks/usePrivateApi'
import { SearchInput } from "./SearchInput"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"

export const Programs = () => {
  const [recommendedProgram, setRecommendedProgram] = useState()
  const [programs, setPrograms] = useState([])
  const { user } = useUserData()
  const privateAxios = usePrivateApi()
  const { login } = useAuth()
  const userID = localStorage.getItem('userID')
  const userRole = localStorage.getItem('userRole')
  const navigate = useNavigate()

  const fetchPrograms = async () => {
    try {
      if (user.role === "Student") {
        const response = await privateAxios.get(`/users/${userID}/programs`, userRole, { withCredentials: true } )
        console.log({ login})
        setPrograms(response.data.response.restOfPrograms)
        setRecommendedProgram(response.data.response.recommendedPrograms)
      } else if (user.role === "Staff") {
        const response = await privateAxios.get(`/programs/get-programs` )
        setPrograms(response.data.response.programs)
      }
    } catch (err) {
      console.log(err)
      if (err.response && err.response.status === 401) {
        console.log("Token expired. Navigating to /auth")
        navigate('/auth')
       }
    }
  }

  const navigateToCourses = (programID) => {
    navigate(`/courses/${programID}`)
  }

  useEffect(() => {
    const awaitFetchPrograms = async () => {
      await fetchPrograms()
    }
    awaitFetchPrograms()
  }, [user, login.accessToken])

  return (
    <div className={`programs`}>
      <SearchInput />
      {recommendedProgram && (
        <>
          <h2>Recommended</h2>
          <div className="recommended-programs">
              <div 
                className="program-card recommended-program" 
                key={recommendedProgram._id} 
                onClick={() => navigateToCourses(recommendedProgram._id)}
              >
                <div className="book-img-div">
                  <img className="book-img" src="book.png" alt="books" />
                </div>
                <div className="program-details">
                  <p className="program-title">{recommendedProgram.title}</p>
                  <p className="program-description">{recommendedProgram.description}</p>
                </div>
              </div>
          </div>
        </>
      )}
      {recommendedProgram && <h2>Others</h2>}
      <div className="other-programs">
        {programs.map((program) => (
          <div className="program-card" key={program._id} onClick={() => navigateToCourses(program._id)}>
            <div className="book-img-div">
              <img className="book-img" src="book.png" alt="books" />
            </div>
            <div className="program-details">
              <h1 className="program-title">{program.title}</h1>
              <p className="program-description">{program.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
