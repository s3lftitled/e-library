import { privateAxios } from "../utils/api"
import { useEffect } from "react"
import { useCookies } from "react-cookie";
import useTokenRefresh from "./useRefreshToken";

const usePrivateApi = () => {
  const refreshAccessToken = useTokenRefresh()
  const [ cookies ] = useCookies(["access_token"])
  const access_token = cookies.access_token

  useEffect(() => { 
    const requestIntercept = privateAxios.interceptors.request.use(
      config => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${access_token}`
        }
        return config
      }, (error) => Promise.reject(error)
    )

    const responseIntercept = privateAxios.interceptors.response.use(
      response => response,
      async (error) => {
        const prevRequest = error?.config
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true
          const newAccessToken = await refreshAccessToken()
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
  }, [refreshAccessToken])

  return privateAxios
}

export default usePrivateApi