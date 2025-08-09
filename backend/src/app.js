const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const error = require('./middleware/error')

function createApp() {
  const app = express()

  const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

  app.use(helmet())
  app.use(cors({ origin: CORS_ORIGIN }))
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan('tiny'))

  app.get('/health', (req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV || 'development', uptime: process.uptime() })
  })

  app.use('/v1', require('./routes'))

  app.use(error.notFound)
  app.use(error.handler)

  return app
}

module.exports = { createApp }
