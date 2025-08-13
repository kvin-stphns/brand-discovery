const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const error = require('./middleware/error')

function createApp() {
  const app = express()

  const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
  const NODE_ENV = process.env.NODE_ENV || 'development'

  // trust proxy only if explicitly set
  if (process.env.TRUST_PROXY && process.env.TRUST_PROXY !== 'false') {
    app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY)
  }

  // Security & utilities
  app.use(helmet())
  app.use(cors({ origin: CORS_ORIGIN, credentials: false }))
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'tiny'))

  // Global rate limiting
  const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false })
  app.use(globalLimiter)

  // Stricter buckets for auth and checkout
  const strictLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
  app.use(['/api/auth', '/api/affiliate/checkout'], strictLimiter)

  // Health endpoints
  // Basic root check
  app.get('/', (_req, res) => {
    res.type('text/plain').send('Backend OK')
  })

  // Detailed healthz
  app.get('/healthz', (_req, res) => {
    const version = require('../package.json').version || '0.0.0'
    res.json({ ok: true, uptime: process.uptime(), version })
  })

  // API routes
  app.use('/api', require('../routes'))

  // Centralized errors
  app.use(error.notFound)
  app.use(error.handler)

  return app
}

module.exports = { createApp }
