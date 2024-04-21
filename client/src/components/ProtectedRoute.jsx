import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ allowedRoles }) => {
  const { accessToken } = useAuth();
  const userRole = localStorage.getItem('userRole')

  // Check if access token is present and user has the required role
  const isAuthorized = accessToken && allowedRoles.includes(userRole)

  // Redirect to authentication if there's no access token
  if (!accessToken) {
    return <Navigate to="/auth" />
  }

  // Redirect to home if user role is not allowed
  if (!isAuthorized) {
    return <Navigate to="/" />
  }

  return <Outlet />
}

export default ProtectedRoute
