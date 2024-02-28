import './home.css'

export const Home = () => {
  return (
    <>
      <div className='home-container'>
        <div className='introduction-section'>
          <h1>Welcome to PanpacificU's E-Library</h1>
        </div>
        <div className='main-section'>
          <div className='profile-section'>
            <h2>Profile Section</h2>
          </div>
          <div className='library-section'>
            <h2>Library Section</h2>
          </div>
        </div>
      </div>
    </>
    
  )
}