const mongoose = require('mongoose')
let memoryServer = null

let isConnected = false
let connectingPromise = null

async function connectToDatabase({ maxRetries = 5, initialDelayMs = 500 } = {}) {
  if (isConnected) return mongoose.connection
<<<<<<< HEAD
  if (connectingPromise) return connectingPromise

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brand_discovery'
  mongoose.set('strictQuery', true)

  let attempt = 0
  let delay = initialDelayMs

  connectingPromise = (async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 3000,
        })
        isConnected = true
        return mongoose.connection
      } catch (err) {
        attempt += 1
        if (attempt > maxRetries) {
          connectingPromise = null
          throw err
        }
        // eslint-disable-next-line no-console
        console.warn(`[db] connect failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms:`, err.message)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay = Math.min(delay * 2, 10_000)
      }
    }
  })()

  return connectingPromise
=======
  const useMemory = String(process.env.MONGODB_IN_MEMORY || '').toLowerCase() === 'true' || String(process.env.MONGODB_URI || '').toLowerCase() === 'memory'
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brand_discovery'

  if (useMemory) {
    const { MongoMemoryServer } = require('mongodb-memory-server')
    memoryServer = await MongoMemoryServer.create()
    uri = memoryServer.getUri()
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  })
  isConnected = true
  return mongoose.connection
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
}

async function disconnectFromDatabase() {
  if (!isConnected && !mongoose.connection?.readyState) return
  try {
    await mongoose.disconnect()
  } finally {
    isConnected = false
    connectingPromise = null
  }
}

module.exports = { connectToDatabase, disconnectFromDatabase }