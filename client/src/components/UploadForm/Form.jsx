import { useEffect, useState } from 'react'
import api from '../../../utils/api'
import './Form.css'

const Form = ({ onClose, type, ID }) => {
  const [formDatas, setFormDatas] = useState({})
  const [file, setFile] = useState(null)
  const userID = localStorage.getItem("userID")

  useEffect(() => {
    console.log(type)
    console.log(ID)
  }, [ID])

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
  
    // Check if the value needs to be parsed as JSON
    try {
      formattedValue = JSON.parse(value)
    } catch (error) {
      // Ignore parsing errors
    }
  
    setFormDatas((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFile(file)
  }

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      let endpoint = ''
      let response
  
      if (type === 'program') {
        endpoint = '/programs/create-programs'
        response = await api.post(endpoint, { title: formDatas.title, description: formDatas.description})
      } else if (type === 'course') {
        response = await api.post(`/courses/programs/${ID}/create-course`, { title: formDatas.title })
        console.log(response)
      } else if (type === 'learning-material') {
        endpoint = `/learning-materials/courses/${ID}/${userID}`
        let formData = new FormData()
        formData.append('title', formDatas.title)
        formData.append('author', formDatas.author)
        formData.append('file', file)
        response = await api.post(endpoint, formData)
      } else if (type === 'change-password') {
        endpoint = `/auth/change-password/${userID}`
        response = await api.put(endpoint, { 
          currentPassword: formDatas.currentPassword, 
          newPassword: formDatas.newPassword,
          newPasswordConfirmation: formDatas.newPasswordConfirmation
        })
      }

      if (response.status === 201) {
        alert('Data has been submitted successfully')
        onClose()
      } else if (response.status === 200) {
        alert(response.data.msg)
        onClose()
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
        <input type="text" name="title" placeholder="Program Name" onChange={handleFieldChange} />
        <input type="text" name="description" placeholder="Program Description" onChange={handleFieldChange} />
      </>
    )
  } else if (type === 'course') {
    fields = (
      <>
        <input type="text" name="title" placeholder="Course Name" onChange={handleFieldChange} />
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
  } else if (type === 'change-password') {
    fields = (
      <>
        <input type='password' name='currentPassword' placeholder='Current password' onChange={handleFieldChange} />
        <input type='password' name='newPassword' placeholder='New password' onChange={handleFieldChange} />
        <input type='password' name='newPasswordConfirmation' placeholder='Confirm new password' onChange={handleFieldChange} />
      </>
    )
  }

  return (
    <>
      <div className="overlay" onClick={onClose} /> 
      <div className="form-container">
        <h2>{type === 'change-password' ? 'Change Password' : `Add ${type}`}</h2>
        <form onSubmit={handleSubmission}>
          {fields}
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  )
}

export default Form