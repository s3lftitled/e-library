const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /refresh
router.post('/refresh', async (req, res) => {
  try {

    const { refreshToken } = req.cookies

    console.log("refresh" , refreshToken  )

    if (!refreshToken) {
      console.error("Missing refresh token")
      throw new Error("Missing refresh token")
    }

    const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY)

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.SECRET_KEY,
      { expiresIn: '30m' }
    )

    console.log('Token refreshed')
    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true, sameSite: 'none' });
    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
    console.log(newAccessToken)
    res.status(200).json({ msg: 'token refreshed'})
  } catch (error) {
    console.error('Error refreshing token:', error)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
})

module.exports = router
