const UserRepository = require('../repositories/userRepository')
const VisitorRepository = require('../repositories/visitorRepository')
const express = require('express') 
const router = express.Router()
const { getLibraryStatistics, visitorStatistics } = require('../controller/adminController')

const userRepository = new UserRepository()
const visitorRepository = new VisitorRepository()

// Get user statistics (accessible only by librarian)
router.get('/get-statistics', (req, res) => getLibraryStatistics(req, res, userRepository))

// Endpoint to get daily, weekly, and monthly visitors along with their programs
router.get('/api/visitors', (req, res) => visitorStatistics(req, res, visitorRepository))


module.exports = router