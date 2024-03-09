import { useEffect } from "react"
import useTokenRefresh from "./useRefreshToken"
import { useAuth } from "../context/AuthContext"
import { privateAxios } from "../utils/api"

const usePrivateApi = () => {
  const refreshAccessToken = useTokenRefresh()
  const login= useAuth()

  useEffect(() => {
    const requestIntercept = privateAxios.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${login?.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    const responseIntercept = privateAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config

        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true

          try {
            const newAccessToken = await refreshAccessToken()
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return privateAxios(prevRequest);
          } catch (refreshError) {
            console.error('Failed to refresh access token:', refreshError)
            return Promise.reject(error)
          }
        }

        return Promise.reject(error)
      }
    )

    return () => {
      privateAxios.interceptors.response.eject(responseIntercept)
      privateAxios.interceptors.request.eject(requestIntercept)
    }
  }, [refreshAccessToken, login])

  return privateAxios
}

export default usePrivateApi
