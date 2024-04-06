import React, { useState } from "react"
import "./LearningMaterials.css"

const NoteTaker = ({ showNote, onClose }) => {
  const [note, setNote] = useState("")

  const handleChange = (e) => {
    setNote(e.target.value)
  }

  const saveNote = () => {
    console.log("Note saved:", note)
  
    // Create a Blob with the note content
    const blob = new Blob([note], { type: "text/plain" })
  
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob)
  
    // Create a temporary anchor element
    const anchorElement = document.createElement("a")
  
    // Set the href attribute to the URL of the Blob
    anchorElement.href = url
  
    // Set the download attribute to specify the file name
    anchorElement.download = "note.txt"
  
    // Programmatically trigger a click event on the anchor element
    anchorElement.click()
  
    // Clean up by revoking the URL
    URL.revokeObjectURL(url)
  
    // Clear the note content
    setNote("")
  }
  
  return (
    <div className={`note-taker ${showNote ? "show" : "hide"}`}>
      <button className="close-button" onClick={onClose}>
        Close
      </button>
      <textarea
        value={note}
        onChange={handleChange}
        placeholder="Write your note here..."
      />
      <button onClick={saveNote}>Save</button>
    </div>
  )
}

export default NoteTaker
