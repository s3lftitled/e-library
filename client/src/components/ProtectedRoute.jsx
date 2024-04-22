import { Navigate, Outlet } from 'react-router-dom'
import useAuth from "../../hooks/useAuth"

const ProtectedRoute = ({ allowedRoles }) => {
  const { auth } = useAuth()
  const userRole = localStorage.getItem('userRole')

  // Check if access token is present and user has the required role
  const isAuthorized = auth?.accessToken && allowedRoles.includes(userRole)

  // Redirect to authentication if there's no access token
  if (!auth?.accessToken) {
    return <Navigate to="/auth" />
  }

  // Redirect to home if user role is not allowed
  if (!isAuthorized) {
    return <Navigate to="/" />
  }

  return <Outlet />
}

export default ProtectedRoute
