// Import necessary modules and packages
const express = require('express')
const router = express.Router()

// Import repositories and controllers
const UserRepository = require('../repositories/userRepository')
const VisitorRepository = require('../repositories/visitorRepository')
const { getLibraryStatistics, visitorStatistics } = require('../controller/adminController')

// Create instances of repositories
const userRepository = new UserRepository()
const visitorRepository = new VisitorRepository()

// Route for getting library statistics (accessible only by librarian)
router.get('/get-statistics', (req, res) => getLibraryStatistics(req, res, userRepository))

// Endpoint to get daily, weekly, and monthly visitors along with their programs
router.get('/api/visitors', (req, res) => visitorStatistics(req, res, visitorRepository))

// Export the router for use in other files
module.exports = router
