// Import necessary modules and packages
const express = require('express')
const router = express.Router() // Creating a router object to handle routes

// Importing the controller for refreshing access token
const refreshAccessToken = require('../controller/tokenController')

// Define a route for refreshing access token
// This route handles POST requests to /refresh endpoint
router.post('/refresh', refreshAccessToken)

// Export the router to make it available for use in other files
module.exports = router
