const mongoose = require('mongoose')

let isConnected = false

async function connectToDatabase() {
  if (isConnected) return mongoose.connection
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brand_discovery'
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 3000,
  })
  isConnected = true
  return mongoose.connection
}

module.exports = { connectToDatabase }