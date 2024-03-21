import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import useTokenRefresh from "../../hooks/useRefreshToken"
import { useAuth } from "../../context/AuthContext"
import Spinner from "./Spinner/Spinner"

const PersistLogin = () => {
  const [ isLoading, setIsLoading ] = useState(true)
  const refreshAccessToken = useTokenRefresh()
  const { login } = useAuth()

  useEffect(() => {
    console.log('persist loaded')
    const verifyToken = async () => {
      try {
        await refreshAccessToken()
      } catch (err) {
        console.log(err)
      } finally {
        setIsLoading(false)
      }
    }
    !login?.accessToken ? verifyToken() : setIsLoading(false)
  }, [])

  return (
    <>
      { isLoading ? <Spinner text={'Loading...'} /> : <Outlet />}
    </>
  )
}

export default PersistLogin
