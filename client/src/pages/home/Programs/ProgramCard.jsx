import { useState } from "react"

const ProgramCard = ({ program, onClick, isDarkMode, onRename }) => {
  const [ formData, setFormData ] = useState({ })
  const [ isEditing, setIsEditing ] = useState(false)
  const userRole = localStorage.getItem('userRole')

  const handleSave = () => {
    console.log(formData.newTitle, program._id)
    onRename(formData.newTitle, program._id)
    setIsEditing(false)
  }

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
  
    try {
      formattedValue = JSON.parse(value)
    } catch (error) {
      // Ignore parsing errors
    }
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }))
  }

  return (
    <div className={`program-card ${isDarkMode ? 'dark-mode' : ''}`} onClick={onClick}>
      <div className="book-img-div">
        <img className="book-img" src="book.png" alt="books" />
      </div>
      <div className="program-details">
        {isEditing ? (
          <>
            <input
              type="text"
              name="newTitle"
              value={formData.newTitle}
              onChange={handleFieldChange} 
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="new-title-input"
            />
            <button className="change-title-btn" onClick={(e) => { e.stopPropagation(e); handleSave()}}>Save</button>
          </>
        ) : (
          <h1 className="program-title">{program.title}</h1>
        )}
        <p className="program-description">{program.description}</p>
      </div>
      { userRole === 'Librarian' &&
       <div>
        {!isEditing && <button className="change-title-btn" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>Edit</button>}
        {isEditing && <button className="change-title-btn" onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}>Cancel</button>}
       </div>
      }
    </div>
  )
}

export default ProgramCard