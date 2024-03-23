import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import Spinner from './components/Spinner/Spinner'

// Lazy load components
const Authentication = lazy(() => import('./pages/auth/Auth'))
const Home = lazy(() => import('./pages/home/Home'))
const VerificationCodeInput = lazy(() => import('./pages/auth/Verification'))
const Form = lazy(() => import('./components/UploadForm/Form'))
const PersistLogin = lazy(() => import('./components/PersistLogin'))
const Courses = lazy(() => import('./pages/courses/Courses'))
const FileUploadComponent = lazy(() => import('./pages/learningMaterials/UploadLearningMaterial'))
const LearningMaterials = lazy(() => import('./pages/learningMaterials/LearningMaterials'))
const SelectedPdfPage = lazy(() => import('./pages/learningMaterials/PDFShower'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Spinner text="Loading..." />}>
          <Routes>
            <Route path="/auth" element={<Authentication />} />
            <Route path="/welcome" element={<Spinner text="Welcome to our E-Library..." />} />
            <Route element={<PersistLogin />}>
              <Route path="/" element={<Home />} />
              <Route path="/courses/:programID" element={<Courses />} />
              <Route path="/verify/:email" element={<VerificationCodeInput />} />
             
              <Route path="/learning-materials/:courseID/:programID" element={<LearningMaterials />} />
              <Route path="/upload-learning-material" element={<FileUploadComponent />} />
              <Route path="/view-material/:materialID" element={<SelectedPdfPage />} />
              <Route element={<ProtectedRoute allowedRoles={['Librarian']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['Librarian']} />}>
                <Route path="/form/:type/:programID" element={<Form />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App