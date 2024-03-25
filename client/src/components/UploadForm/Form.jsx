import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../../utils/api'
import './Form.css'

const Form = ({ onClose, type, programID }) => {
  const [formData, setFormData] = useState({})
  const [file, setFile] = useState(null)

  useEffect(() => {
    console.log(type)
    console.log(programID)
  }, [programID])

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFile(file);
  }

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      let endpoint = ''
      let response
  
      if (type === 'program') {
        endpoint = '/programs/create-programs'
        response = await api.post(endpoint, { title: formData.name, description: formData.description })
      } else if (type === 'course') {
        response = await api.post(`/courses/programs/${programID}/create-course`, { title: formData.name })
      } else if (type === 'learning-material') {
        endpoint = '/learning-materials/create-learning-materials'
        response = await api.post(endpoint, { title: formData.name, author: formData.author, file: formData.file })
      }
  

      if (response.status === 201) {
        alert('Data has been submitted successfully')
        onClose(); // Invoke onClose function here if submission is successful
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error || 'An error occurred. Please try again.')
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }

  let fields
  if (type === 'program') {
    fields = (
      <>
        <input type="text" name="name" placeholder="Program Name" onChange={handleFieldChange} />
        <input type="text" name="description" placeholder="Program Description" onChange={handleFieldChange} />
      </>
    )
  } else if (type === 'course') {
    fields = (
      <>
        <input type="text" name="name" placeholder="Course Name" onChange={handleFieldChange} />
      </>
    )
  } else if (type === 'learning-material') {
    fields = (
      <>
        <input type="text" name="title" placeholder="Material Title" onChange={handleFieldChange} />
        <input type="text" name="author" placeholder="Author" onChange={handleFieldChange} />
        <input type="file" name="file" placeholder="Upload file" onChange={handleFileChange}/>
      </>
    )
  }

  return (
    <>
      <div className="overlay" onClick={onClose} /> {/* Overlay to dim the background */}
      <div className="form-container">
        <h2>Add {type}</h2>
        <form onSubmit={handleSubmission}>
          {fields}
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  )
}

export default Form
