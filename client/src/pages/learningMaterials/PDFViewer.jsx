import React, { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import './LearningMaterials.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PdfViewer = ({ pdfUrl }) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)

  const onNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages)) 
  }

  const onPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(1, prevPageNumber - 1))
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  return (
    <div>
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>
      <div>
        <button onClick={onPrevPage} disabled={pageNumber <= 1}>Previous Page</button>
        <span>Page {pageNumber} / {numPages}</span>
        <button onClick={onNextPage} disabled={pageNumber >= numPages}>Next Page</button>
      </div>
    </div>
  )
}

export default PdfViewer
