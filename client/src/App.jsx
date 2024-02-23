import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Authentication } from './pages/auth'
import './App.css'
import { Home } from './pages/home'
import VerificationCodeInput from './pages/auth/Verification'

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Authentication />}/>
        <Route path='/home' element={<Home /> } />
        <Route path='/verify/:email' element={<VerificationCodeInput />}/>
        <Route />
        <Route />
        <Route />
      </Routes>
    </Router>
    </>
  )
}

export default App
