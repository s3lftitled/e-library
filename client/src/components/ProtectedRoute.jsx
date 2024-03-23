import { Route, Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({  allowedRoles }) => {
  const userRole = localStorage.getItem('userRole')

  console.log(userRole)

  const isAuthorized = allowedRoles.includes(userRole)

  return (
    isAuthorized ? <Outlet /> : <Navigate to='/'/>
  )
}

export default ProtectedRoute
