import { useState, useEffect } from "react"
import api from "../../../utils/api"

const Form = () => {
  const [ title, setTitle ] = useState('')
  const [ description, setDescription ] = useState('')

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      const result = await api.post('/e-library/programs', {title, description})

      if (result.status === '200') {
        alert('Program succesfully added')
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.msg)
      }
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