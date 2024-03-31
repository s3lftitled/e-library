import axios from 'axios'

const BASE_URL = 'https://e-library-1.onrender.com'

const api = axios.create({
  baseURL: BASE_URL
})

export const privateAxios = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json'},
  withCredentials: true
})


export default api
