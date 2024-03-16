import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Authentication } from './pages/auth/Auth'
import { AuthProvider } from '../context/AuthContext'
import './App.css'
import { Home } from './pages/home/Home'
import VerificationCodeInput from './pages/auth/Verification'
import Form from './pages/home/form-sample'
import PersistLogin from './components/PersistLogin'
import { Spinner } from './components/Spinner'
import { Courses } from './pages/courses/Courses'
import FileUploadComponent from './pages/learningMaterials/UploadLearningMaterial'
import { LearningMaterials } from './pages/learningMaterials/LearningMaterials'
import SelectedPdfPage from './pages/learningMaterials/PDFShower'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Authentication />}/>
          <Route path='/welcome' element={<Spinner text="Welcome to our E-Library..."/>} />
          <Route element={<PersistLogin />}>
            <Route path='/' element={<Home /> } />
            <Route path='/courses/:programID' element={<Courses />} />
            <Route path='/verify/:email' element={<VerificationCodeInput />}/>
            <Route path='/form' element={<Form />}/>
            <Route path='/learning-materials/:courseID' element={<LearningMaterials />} />
            <Route path='/upload-learning-material' element={<FileUploadComponent />} />
            <Route path='/view-material/:materialID' element={<SelectedPdfPage />} />
            <Route />
            <Route />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
