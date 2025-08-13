require('dotenv').config()
const { createApp } = require('./src/app')
const { connectToDatabase, disconnectFromDatabase } = require('./utils/db')

const PORT = process.env.PORT || 3001

async function start() {
  const app = createApp()

  // Connect DB with retry handled inside utility
  await connectToDatabase().catch((err) => {
    // eslint-disable-next-line no-console
    console.warn('[db] connection failed (continuing):', err.message)
  })

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`)
  })

  // Graceful shutdown
  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received. Shutting down...`)
    server.close(async () => {
      try {
        await disconnectFromDatabase()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[db] disconnect error', e)
      } finally {
        process.exit(0)
      }
    })
    // Fallback hard exit if close hangs
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start()