import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../../utils/api"


export const LearningMaterials = () => {
  const [learningMaterials, setLearningMaterials] = useState([])
  const [selectedPdf, setSelectedPdf] = useState(null);
  const { courseID } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLearningMaterials = async () => {
      try {
        const response = await api.get(`/learning-materials/courses/${courseID}`)
        setLearningMaterials(response.data.learningMaterials)
        console.log(learningMaterials)
      } catch (err) {
        console.log(err)
      }
    }

    fetchLearningMaterials()
  }, [courseID])

  const handlePdfClick = (materialID) => {
    navigate(`/view-material/${materialID}`)
  }

  return (
    <>
      <h1>Learning Materials</h1>
      {learningMaterials.length > 0 ? (
        learningMaterials.map((material) => (
          <div key={material._id}>
            <p>{material.title}</p>
            <button onClick={() => handlePdfClick(material._id)}>View PDF</button>
          </div>
        ))
      ) : (
        <p>No learning materials found</p>
      )}
    </>
  )
}
