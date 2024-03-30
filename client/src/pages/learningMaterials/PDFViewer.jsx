import React, { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import './LearningMaterials.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PdfViewer = ({ pdfUrl }) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(null)
  const [scale, setScale] = useState(1.0)

  const onNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages)); 
  }

  const onPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(1, prevPageNumber - 1));
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 4.0))
  }

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.25))
  }

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-toolbar">
        <button onClick={onPrevPage} disabled={pageNumber <= 1}>Previous Page</button>
        <span>Page {pageNumber} / {numPages}</span>
        <button onClick={onNextPage} disabled={pageNumber >= numPages}>Next Page</button>
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
      </div>
      <div className="pdf-viewer">
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} scale={scale} />
        </Document>
      </div>
    </div>
  )
}

export default PdfViewer
