require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const { connectToDatabase } = require('./utils/db')

const app = express()

// Security & utilities
app.use(helmet())
app.use(cors({ origin: '*', credentials: false }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

// Rate limiting (basic)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 })
app.use(limiter)

// Health check
app.get('/healthz', (req, res) => res.json({ ok: true }))

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Brand Discovery API', version: '1.0.0' },
    servers: [{ url: '/api' }],
  },
  apis: ['./routes/**/*.js', './controllers/**/*.js'],
})
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
const apiRouter = require('./routes')
app.use('/api', apiRouter)

// DB connect (no throw if fails in non-prod)
connectToDatabase().catch((err) => {
  // eslint-disable-next-line no-console
  console.warn('[db] connection failed (continuing):', err.message)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`)
})