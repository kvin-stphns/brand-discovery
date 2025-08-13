const mongoose = require('mongoose');

let memoryServer = null;
let isConnected = false;
let connectingPromise = null;

/**
 * Connect to MongoDB with:
 * - real Mongo when MONGODB_URI is a normal URI
 * - optional in-memory Mongo when MONGODB_IN_MEMORY=true or MONGODB_URI=memory
 * Includes retry/backoff to tolerate temporary failures.
 */
async function connectToDatabase({ maxRetries = 5, initialDelayMs = 500 } = {}) {
  if (isConnected) return mongoose.connection;
  if (connectingPromise) return connectingPromise;

  const wantsMemory =
    String(process.env.MONGODB_IN_MEMORY || '').toLowerCase() === 'true' ||
    String(process.env.MONGODB_URI || '').toLowerCase() === 'memory';

  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brand_discovery';

  connectingPromise = (async () => {
    if (wantsMemory) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
    }

    mongoose.set('strictQuery', true);

    let attempt = 0;
    let delay = initialDelayMs;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        return mongoose.connection;
      } catch (err) {
        attempt += 1;
        if (attempt > maxRetries) {
          connectingPromise = null;
          throw err;
        }
        // eslint-disable-next-line no-console
        console.warn(
          `[db] connect failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms:`,
          err.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 10_000);
      }
    }
  })();

  return connectingPromise;
}

async function disconnectFromDatabase() {
  if (!mongoose.connection || mongoose.connection.readyState === 0) return;
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } finally {
    isConnected = false;
    connectingPromise = null;
  }
}

module.exports = { connectToDatabase, disconnectFromDatabase };