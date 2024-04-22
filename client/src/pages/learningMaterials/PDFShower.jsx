import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import PdfViewer from "./PDFViewer"
import usePrivateApi from "../../../hooks/usePrivateApi"

export const SelectedPdfPage = () => {
  const [selectedPdf, setSelectedPdf] = useState([])
  const { materialID } = useParams()
  const userID = localStorage.getItem("userID")
  const privateAxios = usePrivateApi()

  useEffect(() => {
    const fetchSelectedPdf = async () => {
      try {
        const response = await privateAxios.get(`/learning-materials/get-material/${materialID}/${userID}`)
        setSelectedPdf(response.data.material)
        console.log(response.data.material.downloadUrl)
        console.log('FETCHED')
      } catch (err) {
        console.log(err)
      }
    }

    fetchSelectedPdf()
  }, [materialID])

  return (
    <div>
      { selectedPdf && <PdfViewer pdfUrl={selectedPdf.downloadUrl} />}
    </div>
  )
}

export default SelectedPdfPage 