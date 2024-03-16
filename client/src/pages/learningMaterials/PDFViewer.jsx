import React, { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import './LearningMaterials.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PdfViewer = ({ pdfUrl }) => {
  const [pageNumber, setPageNumber] = useState(1)

  const onNextPage = () => {
    setPageNumber(prevPageNumber => prevPageNumber + 1)
  }

  const onPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(1, prevPageNumber - 1))
  }

  return (
    <div>
      <Document file={pdfUrl}>
        <Page pageNumber={pageNumber} />
      </Document>
      <div>
        <button onClick={onPrevPage} disabled={pageNumber <= 1}>Previous Page</button>
        <span>Page {pageNumber}</span>
        <button onClick={onNextPage}>Next Page</button>
      </div>
    </div>
  )
}

export default PdfViewer
