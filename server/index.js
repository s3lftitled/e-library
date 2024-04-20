const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
dotenv.config()

// Import the connectDB function to establish a connection with MongoDB
const connectDB = require('./db/connect')

// Import user and e-library routes
const auth = require('./router/auth')
const users = require('./router/user')
const departments = require('./router/departments')
const programs = require('./router/programs')
const courses = require('./router/courses')
const learningMaterials = require('./router/learningMaterials')
const token = require('./router/token')
const adminDashboard = require('./router/admin')

// Create an Express application
const app = express()

const corsOptions = {
  origin: process.env.CLIENT, // replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.use(cookieParser())

// Configure Express to parse JSON requests with a maximum size limit of 50mb
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb', parameterLimit: 1000000 }))

// Ensuring security measures 
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())

app.use(express.static(path.join(__dirname, 'files')))

// Set the port for the server to run on, using the specified PORT or default to 5000
const port = process.env.PORT || 5001

// Use the user and e-library routes in the application
app.use('/auth', auth)
app.use('/users', users)
app.use('/department', departments)
app.use('/programs', programs)
app.use('/courses', courses)
app.use('/learning-materials', learningMaterials)
app.use('/token', token)
app.use('/admin-dashboard', adminDashboard)

// Serve React app on all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
})

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
