const express = require('express')
const router = express.Router()
const refreshAccessToken = require('../controller/tokenController')


// POST /refresh
router.post('/refresh', refreshAccessToken )

module.exports = router
