const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /refresh
router.post('/refresh', async (req, res) => {
  try {

    const { refresh_token } = req.body

    console.log("refresh" , refresh_token  )

    if (!refresh_token) {
      console.error("Missing refresh token")
      throw new Error("Missing refresh token")
    }

    const decoded = jwt.verify(refresh_token, process.env.SECRET_KEY)

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.SECRET_KEY,
      { expiresIn: '30m' }
    )

    console.log('Token refreshed')
    res.json({ accessToken: newAccessToken })
  } catch (error) {
    console.error('Error refreshing token:', error)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
})

module.exports = router
