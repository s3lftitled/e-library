const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

const connectDB = require('./db/connect')
const users = require('./router/user')
const eLibrary = require('./router/e-library')

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb'}))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

const port = process.env.PORT || 5000

app.use('/users', users)
app.use('/e-library', eLibrary)

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => {
      console.log(`Server is now listening on ${port}`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
