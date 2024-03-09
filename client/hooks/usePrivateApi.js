import { useEffect } from "react"
import useTokenRefresh from "./useRefreshToken"
import { useAuth } from "../context/AuthContext"
import { privateAxios } from "../utils/api"

const usePrivateApi = () => {
  const refreshAccessToken = useTokenRefresh()
  const login = useAuth()

  useEffect(() => { 
    console.log('usePrivateApi is running')
    console.log('login:', login.accessToken)
    const requestIntercept = privateAxios.interceptors.request.use(
      config => {
        console.log('request')
        if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${login?.accessToken}`
        }
        return config
      }, (error) => Promise.reject(error)
    )

    const responseIntercept = privateAxios.interceptors.response.use(
      response => response,
      console.log('response'),
      async (error) => {
        const prevRequest = error?.config
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true
          const newAccessToken = refreshAccessToken()
          console.log('new token:', newAccessToken)
          prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          return privateAxios(prevRequest)
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