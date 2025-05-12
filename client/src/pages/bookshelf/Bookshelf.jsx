import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ProfileSection } from "../../components/ProfileSection/ProfileSection"
import usePrivateApi from "../../../hooks/usePrivateApi"
import { MdBookmarkBorder, MdBookmark } from "react-icons/md"
import ToggleDarkMode from "../../components/ToggleDarkMode"

const Bookshelf = () => {
  const [ bookshelf, setBookshelf ] = useState({})
  const [ showProfileSection, setShowProfileSection ] = useState(false)
  const userID = localStorage.getItem("userID")
  const navigate = useNavigate()
  const privateAxios = usePrivateApi()

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('isDarkMode')
    return storedDarkMode ? JSON.parse(storedDarkMode) : false
  })

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const handleToggleDarkMode = () => {
    console.log("Toggle Dark Mode") // for debug
    setIsDarkMode((prev) => !prev)
  }

  useEffect(() => {
    fetchUserBookshelf()
  }, [userID])

  const fetchUserBookshelf = async () => {
    try {
      const response = await privateAxios.get(`/users/${userID}/book-shelf`, { withCredentials: true })

      if (response.status === 200) {
        console.log(response.data.bookshelf)
        setBookshelf(response.data.bookshelf)
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error || 'An error occurred. Please try again.')
      } else {
        alert('An error occurred. Please try again.')
      }
    }
  }

  const handlePdfClick = (materialID) => {
    navigate(`/view-material/${materialID}`)
  }

  const deleteFromBookshelf = async (materialID) => {
    try {
      const response = await privateAxios.delete(`/users/${userID}/delete-from-bookshelf/${materialID}`, { withCredentials: true })

      if (response.status === 200) {
        setBookshelf(prevBookshelf => prevBookshelf.filter(item => item._id !== materialID))
      }
    } catch (err) {
      if (err.response) {
        console.log(err.response)
        alert(err.response)
      }
    }
  }

  return (
    <div className="bookshelf-page__container">
      <header className={`bookshelf-page__header ${isDarkMode ? 'bookshelf-page__header--dark' : ''}`}>
        <ProfileSection 
            showProfileSection={showProfileSection}
            setShowProfileSection={setShowProfileSection}
            isDarkMode={isDarkMode}
        />
        <div className='bookshelf-page__header-content'>
          <ion-icon name="arrow-back" className="bookshelf-page__back-icon" onClick={() => navigate('/')}></ion-icon>
          <h1 className="bookshelf-page__title">Bookshelf</h1>
        </div> 
        <dotlottie-player 
          src="https://lottie.host/c7b8849d-1b44-4cb0-a68f-6874fbafe0f3/AJYxlq4Zs0.json" 
          background="transparent" 
          speed="1" 
          className="bookshelf-page__animation" 
          style={{ width: "110px", height: "auto", margin: "10px" }} 
          loop 
          autoplay>
        </dotlottie-player>
      </header>
      
      <div className="bookshelf-page__cosmic-bg">
        <div className="bookshelf-page__star-field">
          <div className="bookshelf-page__layer"></div>
          <div className="bookshelf-page__layer"></div>
          <div className="bookshelf-page__layer"></div>
        </div>
      </div>
      
      <div className="bookshelf-page__books-container">
        {bookshelf.length > 0 ? (
          bookshelf.map((book) => (
            <div key={book._id} className="bookshelf-page__book">
              <div className="bookshelf-page__book-glow"></div>
              <MdBookmark 
                className="bookshelf-page__bookmark-icon bookshelf-page__bookmark-icon--active" 
                onClick={() => deleteFromBookshelf(book._id)} 
              />
              <p className="bookshelf-page__material-title">{book.title}</p>
              <p className="bookshelf-page__material-author">{book.author}</p>
              <div className="bookshelf-page__underline"></div>
              <button 
                className="bookshelf-page__pdf-button" 
                onClick={() => handlePdfClick(book._id)}
              >
                <span className="bookshelf-page__button-text">View PDF</span>
              </button>
            </div>
          ))
        ) : (
          <div className="bookshelf-page__empty-state">
            <p className="bookshelf-page__empty-text">No learning materials found</p>
            <div className="bookshelf-page__empty-animation"></div>
          </div>
        )}
      </div>
      <ToggleDarkMode isDarkMode={isDarkMode} toggleDarkMode={handleToggleDarkMode}/>

      <style jsx>{`
        .bookshelf-page__container {
          height: 100%;
          min-width: 100%;
          font-family: 'Lexend';
          position: relative;
          overflow-x: hidden;
        }

        .bookshelf-page__cosmic-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          opacity: 0.07;
          pointer-events: none;
        }

        .bookshelf-page__star-field {
          position: relative;
          width: 100%;
          height: 100%;
          perspective: 600px;
        }

        .bookshelf-page__layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #ddd, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 160px 120px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: bookshelf-page__parallax 5s infinite linear;
          opacity: 0.3;
        }

        .bookshelf-page__layer:nth-child(1) {
          animation-delay: 0s;
          animation-duration: 35s;
        }

        .bookshelf-page__layer:nth-child(2) {
          animation-delay: -3s;
          animation-duration: 45s;
        }

        .bookshelf-page__layer:nth-child(3) {
          animation-delay: -5s;
          animation-duration: 55s;
        }

        @keyframes bookshelf-page__parallax {
          0% { transform: translateZ(0) translateY(0); }
          100% { transform: translateZ(0) translateY(200px); }
        }

        .bookshelf-page__header {
          display: flex;
          flex-direction: row;
          height: 130px;
          align-items: center;
          justify-content: space-between;
          color: #fff;
          background-color: #4E7133;
          min-width: 100%;
          box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.3);
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          z-index: 10;
          overflow: hidden;
        }

        .bookshelf-page__header:before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(78,113,51,0) 70%);
          animation: bookshelf-page__pulse 15s infinite linear;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .bookshelf-page__header:hover:before {
          opacity: 1;
        }

        @keyframes bookshelf-page__pulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .bookshelf-page__header--dark {
          background-color: #181c24;
          box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.5);
        }

        .bookshelf-page__header:hover {
          background-color: #0C359E;
          transform: translateY(-3px);
        }

        .bookshelf-page__header--dark:hover {
          background-color: #28292e;
        }

        .bookshelf-page__header-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-evenly;
          margin-left: 80px;
        }

        .bookshelf-page__title {
          font-size: 1.7rem;
          margin-left: 2vh;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
          letter-spacing: 1px;
          position: relative;
        }

        .bookshelf-page__title:after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 0;
          height: 2px;
          background: #fff;
          transition: width 0.5s ease;
        }

        .bookshelf-page__header:hover .bookshelf-page__title:after {
          width: 100%;
        }

        .bookshelf-page__back-icon {
          font-size: 25px;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                      box-shadow 0.3s ease-in-out;
          cursor: pointer;
          position: relative;
          z-index: 2;
        }

        .bookshelf-page__back-icon:hover {
          transform: scale(1.3) rotate(-10deg);
        }

        .bookshelf-page__books-container {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          padding: 30px 0;
          perspective: 1000px;
        }

        .bookshelf-page__book {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 275px;
          width: 180px;
          box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
          margin: 20px;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.95);
          transform-style: preserve-3d;
          overflow: hidden;
        }

        .bookshelf-page__book:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%);
          z-index: 1;
          pointer-events: none;
        }

        .bookshelf-page__book-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
          z-index: 1;
        }

        .bookshelf-page__book:hover {
          transform: translateY(-15px) rotateX(10deg) rotateZ(2deg);
          box-shadow: 0px 30px 50px rgba(0, 0, 0, 0.3);
        }

        .bookshelf-page__book:hover .bookshelf-page__book-glow {
          opacity: 0.7;
        }

        .bookshelf-page__material-title {
          height: 40px;
          width: 90%;
          font-size: 1rem;
          font-weight: bolder;
          justify-content: center;
          text-align: center;
          margin-top: 20px;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .bookshelf-page__book:hover .bookshelf-page__material-title {
          transform: translateZ(20px);
        }

        .bookshelf-page__material-author {
          height: 30px;
          width: 90%;
          font-size: 0.8rem;
          justify-content: center;
          align-items: center;
          text-align: center;
          opacity: 0.7;
          z-index: 2;
          transition: transform 0.3s ease;
        }

        .bookshelf-page__book:hover .bookshelf-page__material-author {
          transform: translateZ(15px);
        }

        .bookshelf-page__underline {
          height: 5px;
          min-width: 80%;
          border-top: 2px solid rgba(23, 23, 23, 0.2);
          margin-bottom: 15px;
          z-index: 2;
          position: relative;
          transition: all 0.3s ease;
        }

        .bookshelf-page__book:hover .bookshelf-page__underline {
          width: 90%;
          border-color: rgba(23, 23, 23, 0.4);
        }

        .bookshelf-page__bookmark-icon {
          position: absolute;
          top: 10px;
          right: 10px;
          color: white;
          border: 1px solid black;
          padding: 5px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 3;
          transition: all 0.3s ease;
          background: rgba(0,0,0,0.2);
        }

        .bookshelf-page__bookmark-icon--active {
          color: black;
          border: 1px solid black;
        }

        .bookshelf-page__bookmark-icon:hover {
          transform: scale(1.2) rotate(10deg);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .bookshelf-page__pdf-button {
          padding: 10px 20px;
          font-size: 10px;
          background-color: #000;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 2;
          position: relative;
          overflow: hidden;
        }

        .bookshelf-page__button-text {
          position: relative;
          z-index: 2;
        }

        .bookshelf-page__pdf-button:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.7s ease;
        }

        .bookshelf-page__book:hover .bookshelf-page__pdf-button {
          background-color: #0f36e4;
          transform: translateZ(30px) scale(1.1);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        .bookshelf-page__pdf-button:hover:before {
          left: 100%;
        }

        .bookshelf-page__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          width: 100%;
        }

        .bookshelf-page__empty-text {
          font-size: 1.2rem;
          color: #555;
          margin-bottom: 20px;
          text-align: center;
        }

        .bookshelf-page__empty-animation {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(78,113,51,0.2) 0%, rgba(78,113,51,0) 70%);
          border-radius: 50%;
          animation: bookshelf-page__pulse-empty 2s infinite ease-in-out;
        }

        @keyframes bookshelf-page__pulse-empty {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }

        @media only screen and (max-width: 768px) {
          .bookshelf-page__title {
            font-size: 1.5rem;
            margin-left: 10px;
          }

          .bookshelf-page__header-content {
            margin-left: 60px;
          }
        }

        @media only screen and (max-width: 683px) {
          .bookshelf-page__header-content {
            margin-left: 20px;
          }

          .bookshelf-page__title {
            font-size: 1.4rem;
            margin-left: 10px;
          }

          .bookshelf-page__book {
            height: 265px;
            width: 160px;
            margin: 20px;
          }
        }

        @media only screen and (max-width: 610px) { 
          .bookshelf-page__title {
            font-size: 1.2rem;
            margin-left: 5px;
          }
        }

        @media only screen and (max-width: 480px) {
          .bookshelf-page__title {
            font-size: 1rem;
            margin-left: 5px;
          }

          .bookshelf-page__book {
            height: 255px;
            width: 150px;
          }

          .bookshelf-page__material-title {
            font-size: 0.7rem;
          }

          .bookshelf-page__material-author {
            font-size: 0.5rem;
          }
        }

        @media only screen and (max-width: 400px) {
          .bookshelf-page__title {
            font-size: 1rem;
            margin-left: 5px;
          }

          .bookshelf-page__book {
            height: 250px;
            width: 145px;
            margin: 10px;
          }
        }
      `}</style>
    </div>
  )
}

export default Bookshelf