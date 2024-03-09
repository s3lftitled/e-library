import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import useTokenRefresh from "../../hooks/useRefreshToken"
import { useAuth } from "../../context/AuthContext"

const PersistLogin = () => {
  const [ isLoading, setIsLoading ] = useState(true)
  const refreshAccessToken = useTokenRefresh()
  const { login } = useAuth()

  useEffect(() => {
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
      { isLoading ? <p>Loading....</p> : <Outlet />}
    </>
  )
}

export default PersistLogin
