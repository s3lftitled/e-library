import { useEffect, useState } from "react"
import useUserData from "../../../hooks/useUserData"
import { useCookies } from "react-cookie"
import api from "../../../utils/api"

export const Programs = () => {
  const userID = localStorage.getItem("userID")
  const [ recommendedPrograms, setRecommendedPrograms ] = useState([])
  const [ programs, setPrograms ] = useState([])
  const { user } = useUserData()
  const [cookies] = useCookies(["access_token"])
  const access_token = cookies.access_token
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {

        const config = {
          headers: {
            Authorization: `Bearer ${access_token}`, 
          },
        }
        if (user.role === 'Student') {
          const response = await api.get(`/e-library/${userID}/programs`, config)

          setPrograms(response.data.restOfPrograms)
          setRecommendedPrograms(response.data.recommendedPrograms)
        } else {
          const response = await api.get(`/e-library/programs`, config)
          setPrograms(response.data.programs)
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchPrograms()
    console.log('NAGRERENDER')
  }, [user])

  return (
    <div className="programs">
      { recommendedPrograms.length > 0 &&
        <>
          <h2>Recommended</h2>
          <div className="recommended-programs">
          { recommendedPrograms.map((program) => (
            <div className="program-card">
              <p>{program.title}</p>
              <p>{program.description}</p>
            </div>
          ))}
          </div> 
        </>
      }
      { recommendedPrograms.length > 0 && <h2>Others</h2> }
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