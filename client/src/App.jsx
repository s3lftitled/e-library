import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Authentication } from './pages/auth'
import './App.css'

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Authentication />}/>
        <Route />
        <Route />
        <Route />
        <Route />
        <Route />
      </Routes>
    </Router>
    </>
  )
}

export default App
