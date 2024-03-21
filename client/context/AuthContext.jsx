import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken ] = useState(null)

  const login = (token) => {
    setAccessToken(token.accessToken)
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
  }

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
