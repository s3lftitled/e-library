import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

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
const NotFound = lazy(() => import('./components/NotFound/NotFound'))
const Spinner = lazy(() => import('./components/Spinner/Spinner'))
const Bookshelf = lazy(() => import('./pages/bookshelf/Bookshelf'))
const ForgotPassword = lazy(() => import('./pages/forgot-password/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/password-reset/PasswordResetForm'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Spinner text="Loading..." />}>
          <Routes>
            <Route path="/auth" element={<Authentication />} />
            <Route path="/welcome" element={<Spinner text="Welcome to our E-Library..." />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password/:resetToken' element={<ResetPassword />} />
            <Route element={<PersistLogin />}>
              <Route element={<ProtectedRoute allowedRoles={['Librarian', 'Student', 'Staff']} />}>  
                <Route path="/" element={<Home />} />
                <Route path="/courses/:programID/:programTitle" element={<Courses />} />
                <Route path="/verify/:email" element={<VerificationCodeInput />} />         
                <Route path="/learning-materials/:programID/:programTitle/:courseID/:courseTitle" element={<LearningMaterials />} />
                <Route path="/upload-learning-material" element={<FileUploadComponent />} />
                <Route path="/view-material/:materialID" element={<SelectedPdfPage />} />
                <Route path="/bookshelf" element={<Bookshelf />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App