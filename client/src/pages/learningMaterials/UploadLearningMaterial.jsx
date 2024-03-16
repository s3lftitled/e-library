import { useState } from "react"
import api from "../../../utils/api"

const UploadLearningMaterial = () => {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState("")

  const submitImage = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("title", title)
    formData.append("file", file)
    console.log(title, file)

    const result = await api.post(
      '/learning-materials/courses/65dc210929c86d61e0305dd5',
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    console.log(result)
  }

  return (
    <div>
      <form onSubmit={submitImage}>
        <h4>Upload Learning Materials</h4>
        <br />
        <input
          type="text"
          className="form-control"
          placeholder="Title"
          required
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input
          type="file"
          class="form-control"
          accept="application/pdf"
          required
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br />
        <button type="submit">
          Submit
        </button>
      </form>
    </div>
  )
}

export default UploadLearningMaterial