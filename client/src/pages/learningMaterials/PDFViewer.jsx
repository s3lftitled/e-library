import React, { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import './LearningMaterials.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PdfViewer = ({ pdfUrl }) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [inputPageNumber, setInputPageNumber] = useState("")
  const [numPages, setNumPages] = useState(null)
  const [scale, setScale] = useState(1.5)

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

  const goToPage = () => {
    const pageNumberInt = parseInt(inputPageNumber)
    if (!isNaN(pageNumberInt) && pageNumberInt >= 1 && pageNumberInt <= numPages) {
      setPageNumber(pageNumberInt)
      setInputPageNumber("")
    } else if (pageNumberInt > numPages || pageNumberInt <= 0) {
      alert(`Please enter only valid page from 0 to ${numPages}`)
    }
  }

  const setPageWithButton = () => {
    goToPage()
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
      <div className="set-page-toolbar">
        <input 
          type="number" 
          value={inputPageNumber} 
          onChange={(e) => setInputPageNumber(e.target.value)} 
          onBlur={goToPage} 
          placeholder="Go to page" 
        />
        <button onClick={setPageWithButton}>Go</button>
      </div>
    </div>
  )
}

export default PdfViewer
