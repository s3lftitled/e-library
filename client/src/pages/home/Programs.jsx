import { useEffect, useState } from "react"
import api from "../../../utils/api"

export const Programs = () => {

  const [ programs, setPrograms ] = useState([])
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get('/e-library/programs')

        setPrograms(response.data.programs)
      } catch (err) {
        console.log(err)
      }
    }
    fetchPrograms()
    console.log('NAGRERENDER')
  }, [])

  return (
    <>
      { programs.map((program) => (
        <div className="programs">
          <p>{program.title}</p>
          <p>{program.description}</p>
        </div>
      ))}
    </>
  )
}