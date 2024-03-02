import { useEffect, useState } from "react"
import api from "../../../utils/api"

export const Programs = () => {
  const userID = localStorage.getItem("userID")
  const [ recommendedPrograms, setRecommendedPrograms ] = useState([])
  const [ programs, setPrograms ] = useState([])
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get(`/e-library/${userID}/programs`)

        setPrograms(response.data.restOfPrograms)
        setRecommendedPrograms(response.data.recommendedPrograms)
      } catch (err) {
        console.log(err)
      }
    }
    fetchPrograms()
    console.log('NAGRERENDER')
  }, [])

  return (
    <div className="programs">
      <h2>Recommended</h2>
      <div className="recommended-programs">
      { recommendedPrograms.map((program) => (
        <div className="program-card">
          <p>{program.title}</p>
          <p>{program.description}</p>
        </div>
      ))}
      </div>
      <h2>Others</h2>
      <div className="other-programs">
      { programs.map((program) => (
        <div className="program-card">
          <p>{program.title}</p>
          <p>{program.description}</p>
        </div>
      ))}
      </div>
    </div>
  )
}