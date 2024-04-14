import { useEffect, useCallback } from 'react'
import api from "../utils/api"
import { useAuth } from "../context/AuthContext"

const useTokenRefresh = () => {
  const { login } = useAuth()

  const refreshAccessToken = async () => {
    try {
      console.log('Refreshing token...')
      const refreshResponse = await api.post(
        '/token/refresh', {},
        { withCredentials: true }
      )

      const newAccessToken = refreshResponse.data.newAccessToken

      await login({ accessToken: newAccessToken })

      console.log('Token refreshed')

      return newAccessToken
    } catch (refreshError) {
      console.error("Error refreshing token:", refreshError)
    }
  }

  return refreshAccessToken
}

export default useTokenRefresh
