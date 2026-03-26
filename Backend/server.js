require('dotenv').config()

const express = require('express')
const cors = require('cors')

const apiV1Routes = require('./routes')

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
)
app.use(express.json())

app.use('/api/v1', apiV1Routes)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Avoid leaking stack traces to clients.
  const status = err.statusCode || 500
  res.status(status).json({ message: err.message || 'Server error' })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`)
})

