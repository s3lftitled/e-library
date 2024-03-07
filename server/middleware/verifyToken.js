const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateTokens = (user) => {
  const secretKey = process.env.SECRET_KEY
  
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    secretKey,
    { expiresIn: '30m' } 
  )

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    secretKey,
    { expiresIn: '1d' } 
  )

  return { accessToken, refreshToken }
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send("Unauthorized: Missing or invalid token")
  }

  const token = authHeader.split(' ')[1]
  const secretKey = process.env.SECRET_KEY

  if (!secretKey) {
    console.error("Missing secret key");
    return res.status(500).send("Internal Server Error: Missing secret key");
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error(err);

      if (err.name === 'TokenExpiredError') {
        return res.status(403).send("Forbidden: Token has expired");
      }

      return res.status(403).send("Forbidden: Token verification failed");
    }

    // Attach the decoded user information to the request object
    req.user = decoded
    next()
  })
}

module.exports = { verifyToken, generateTokens }
