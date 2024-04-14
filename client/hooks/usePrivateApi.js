import { useEffect } from "react"
import useTokenRefresh from "./useRefreshToken"
import { useAuth } from "../context/AuthContext"
import { privateAxios } from "../utils/api"

const usePrivateApi = () => {
  const refreshAccessToken = useTokenRefresh()
  const login = useAuth()

  useEffect(() => {
    const requestIntercept = privateAxios.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          console.log('token request', login.accessToken)
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

        if (!prevRequest?.sent && (error?.response?.status === 401 || error?.response?.status === 403)) {
          prevRequest.sent = true
          const newAccessToken = await refreshAccessToken()
          prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          console.log('token response', newAccessToken)
          return privateAxios(prevRequest)
        }

        return Promise.reject(error)
      }
    )

    return () => {
      privateAxios.interceptors.response.eject(responseIntercept)
      privateAxios.interceptors.request.eject(requestIntercept)
    }
  }, [refreshAccessToken])

  return privateAxios
}

export default usePrivateApi
