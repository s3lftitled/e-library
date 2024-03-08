import api from "../utils/api"
import { useCookies } from "react-cookie"

const useTokenRefresh = () => {
  const [ cookies ] = useCookies(["refresh_token"])
  const refresh_token = cookies.refresh_token

  const refreshAccessToken = async () => {
    try {
      console.log(refresh_token)
      const refreshResponse = await api.post(
        '/token/refresh',
        { refresh_token }
      )
      console.log("New token:", refreshResponse.data.accessToken)
      return refreshResponse.data.accessToken
    } catch (refreshError) {
      console.error("Error refreshing token:", refreshError)
    }
  }

  return refreshAccessToken
}

export default useTokenRefresh
