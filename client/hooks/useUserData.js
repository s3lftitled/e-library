import { useState, useEffect } from "react"
import { privateAxios } from "../utils/api"
import { useNavigate } from "react-router-dom"

const useUserData = () => {
  const [user, setUser] = useState({})
  const userID = localStorage.getItem('userID')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await privateAxios.get(
          `/users/get-user/${userID}`,
          { withCredentials: true }
        )
        console.log(response.data.currentUser)
        setUser(response.data.currentUser)
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status === 401 || 400 || 500) {
          console.log("Token expired. Navigating to /auth")
          navigate('/auth')
        }
      }
    }
    fetchUserData()
  }, [])

  return { user }
}

export default useUserData
