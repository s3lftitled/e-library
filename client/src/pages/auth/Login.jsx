import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { useCookies } from "react-cookie";
import api from "../../../utils/api"

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const  [_, setCookies ] = useCookies(['access_token'])
  
  const handleSubmission = async () => {
    try {
      const result = await api.post('users/login', { email, password })  

      if (result.status === 200) {
        const { userID, role, token, refreshToken } = result.data

        // Store user data in localStorage if needed
        setCookies('access_token', token)
        setCookies('refresh_token', refreshToken)
        localStorage.setItem('userID', userID)
        localStorage.setItem('userRole', role)

        alert('Logged in successfully');
        navigate('/');
      }
    } catch (err) {
      console.error(err);

      if (err.response?.data?.msg === 'Please verify your email first') {
        alert(err.response.data.msg);
        navigate(`/verify/${email}`);
      } else {
        alert(err.response?.data?.msg || 'An error occurred');
      }
    }
  };

  return (
    <>
      <h2>Login</h2>
      <form>
        <input
          type='text'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </form>
      <button onClick={handleSubmission}>Login</button>
    </>
  );
};
