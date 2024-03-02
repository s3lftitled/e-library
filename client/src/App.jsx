import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Authentication } from './pages/auth/Auth'
import './App.css'
import { Home } from './pages/home/Home'
import VerificationCodeInput from './pages/auth/Verification'
import Form from './pages/home/form-sample'

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Authentication />}/>
        <Route path='/home' element={<Home /> } />
        <Route path='/verify/:email' element={<VerificationCodeInput />}/>
        <Route path='/form' element={<Form />}/>
        <Route />
        <Route />
      </Routes>
    </Router>
    </>
  )
}

export default App
