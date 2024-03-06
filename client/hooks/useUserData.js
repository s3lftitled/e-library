import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import api from "../utils/api";

const useUserData = () => {
  const [user, setUser] = useState({});
  const [cookies] = useCookies(["access_token"])
  const access_token = cookies.access_token
  const userID = localStorage.getItem("userID")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
        console.log(userID)
        const response = await api.get(
          `/users/get-user/${userID}`,
          config
        )
        setUser(response.data.currentUser)
        console.log(user.departmentName)
        console.log({ user })
      } catch (error) {
        console.log(error)
      }
    }
    fetchUserData()
  }, [])

  return { user }
}

export default useUserData
