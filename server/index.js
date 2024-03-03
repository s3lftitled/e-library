const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

// Import the connectDB function to establish a connection with MongoDB
const connectDB = require('./db/connect')

// Import user and e-library routes
const users = require('./router/user')
const departments = require('./router/departments')
const programs = require('./router/programs')
const courses = require('./router/courses')

// Create an Express application
const app = express()

// Enable CORS middleware for handling cross-origin requests
app.use(cors())

// Configure Express to parse JSON requests with a maximum size limit of 50mb
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Set the port for the server to run on, using the specified PORT or default to 5000
const port = process.env.PORT || 5000

// Use the user and e-library routes in the application
app.use('/users', users)
app.use('/department', departments)
app.use('/programs', programs)
app.use('/courses', courses)

// Function to start the server
const start = async () => {
  try {
    // Connect to the MongoDB database using the provided URI
    await connectDB(process.env.MONGO_URI)

    // Start the server and listen on the specified port
    app.listen(port, () => {
      console.log(`Server is now listening on ${port}`)
    })
  } catch (error) {
    // Log any errors that occur during the startup process
    console.log(error)
  }
}

// Call the start function to initiate the server
start()
