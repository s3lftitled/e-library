import { useState, useEffect } from "react"
import api from "../../../utils/api"

const Form = () => {
  const [ title, setTitle ] = useState('')
  const [ description, setDescription ] = useState('')

  useEffect(() => {
    console.log(title)
  }, [title])

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      const result = await api.post('/e-library/programs', { title, description })

      
    } catch (err) {
      console.log(err)
    }
  }

  
  return (
    <>
      <form onSubmit={handleSubmission}>

        <input 
          type="text"
          placeholder="Enter the program title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input 
          type="text"
          placeholder="Enter the program description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Submit</button>

      </form>
    </>
  )
}

export default Form