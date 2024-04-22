import api from "../utils/api"
import useAuth from "./useAuth"

const useTokenRefresh = () => {
  const { setAuth } = useAuth()

  const refreshAccessToken = async () => {
    try {
      console.log('Refreshing token...')
      const refreshResponse = await api.post(
        '/token/refresh', {},
        { withCredentials: true }
      )

      const newAccessToken = refreshResponse.data.newAccessToken

      setAuth({ accessToken: newAccessToken })

      console.log(newAccessToken)

      console.log('Token refreshed')

      return newAccessToken
    } catch (refreshError) {
      console.error("Error refreshing token:", refreshError)
    }
  }

  return refreshAccessToken
}

export default useTokenRefresh