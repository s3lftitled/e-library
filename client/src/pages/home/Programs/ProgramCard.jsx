import { useState } from "react"

const ProgramCard = ({ program, onClick, isDarkMode, onRename }) => {
  const [formData, setFormData] = useState({ newTitle: program.title })
  const [isEditing, setIsEditing] = useState(false)
  const userRole = localStorage.getItem('userRole')

  const handleSave = (e) => {
    e.stopPropagation()
    onRename(formData.newTitle, program._id)
    setIsEditing(false)
  }

  const handleCancel = (e) => {
    e.stopPropagation()
    setFormData({ newTitle: program.title }) // Reset to original title
    setIsEditing(false)
  }

  const handleFieldChange = (e) => {
    e.stopPropagation()
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleCardClick = (e) => {
    // Only trigger onClick if we're not in edit mode
    if (!isEditing) {
      onClick(e)
    }
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  return (
    <div 
      className={`program-card ${isDarkMode ? 'dark-mode' : ''}`} 
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`View ${program.title} program`}
    >
      <div className="book-img-div">
        <img className="book-img" src="book.png" alt="Program icon" />
      </div>
      
      <div className="program-details">
        {isEditing ? (
          <div onClick={e => e.stopPropagation()}>
            <input
              type="text"
              name="newTitle"
              value={formData.newTitle}
              onChange={handleFieldChange} 
              autoFocus
              className="new-title-input"
              placeholder="Enter new title"
              aria-label="Edit program title"
            />
            <div>
              <button className="change-title-btn" onClick={handleSave}>
                Save
              </button>
              <button className="change-title-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="program-title">{program.title}</h1>
            <p className="program-description">{program.description}</p>
          </>
        )}
      </div>
      
      {userRole === 'Librarian' && !isEditing && (
        <div onClick={e => e.stopPropagation()}>
          <button 
            className="change-title-btn" 
            onClick={handleEditClick}
            aria-label="Edit program title"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  )
}

export default ProgramCard