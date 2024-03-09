const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateTokens = (user) => {
  const secretKey = process.env.SECRET_KEY
  
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    secretKey,
    { expiresIn: '10s' } 
  )

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    secretKey,
    { expiresIn: '30s' } 
  )

  return { accessToken, refreshToken }
}

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken

  if (!token) {
    return res.status(401).send("Unauthorized: Missing token")
  }

  console.log('Received token:', token)
  const secretKey = process.env.SECRET_KEY

  if (!secretKey) {
    console.error("Missing secret key")
    return res.status(500).send("Internal Server Error: Missing secret key")
  }

  if (!token) {
    console.error("Token is missing")
    return res.status(403).send("Unauthorized: Missing token")
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    console.log(token)
    if (err) {
      console.error(err)

      if (err.name === 'TokenExpiredError') {
        return res.status(403).send("Forbidden: Token has expired")
      }

      return res.status(403).send("Forbidden: Token verification failed")
    }

    req.user = decoded
    next()
  })
}

module.exports = { verifyToken, generateTokens }
