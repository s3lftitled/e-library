import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import './Spinner.css'

const Spinner= ({ text }) => {
  const [typedText, setTypedText] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const typeText = async () => {
      for (let i = 0; i < text.length; i++) {
        await new Promise(resolve => setTimeout(() => {
          setTypedText(text.slice(0, i + 1))
          resolve()
        }, 100))
      }
    }

    typeText()

    return () => setTypedText('')
  }, [text])

  useEffect(() => {
    const loaderTimeout = setTimeout(() => {
      navigate('/')
    }, 4000)

    return () => clearTimeout(loaderTimeout)
  }, [])

  return (
   <div className="spinner-div">
      <div className="spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      </div>
      <div className="typewriter-text">{typedText}</div>
    </div>
  )
}

export default Spinner