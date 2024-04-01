import { useEffect } from 'react'
import api from "../utils/api"
import { useAuth } from "../context/AuthContext"

const useTokenRefresh = () => {
  const { login } = useAuth()

  useEffect(() => {
    refreshAccessToken()
  }, [login])

  const refreshAccessToken = async () => {
    try {
      console.log('Refreshing token...')
      const refreshResponse = await api.post(
        '/token/refresh', {},
        { withCredentials: true }
      )

      console.log('new access token', refreshResponse.data.newAccessToken)

      const newAccessToken = refreshResponse.data.newAccessToken

      await login({ accessToken: newAccessToken })

      console.log("New token:", newAccessToken)
      return newAccessToken
    } catch (refreshError) {
      console.error("Error refreshing token:", refreshError)
    }
  }

  return refreshAccessToken
}

export default useTokenRefresh
