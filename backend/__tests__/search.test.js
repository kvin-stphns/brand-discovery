const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { createApp } = require('../src/app')
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db')
const { Brand } = require('../models/brandModel')

const app = createApp()
let mem

beforeAll(async () => {
  mem = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mem.getUri()
  await connectToDatabase({ maxRetries: 1 })
  await Brand.create({ name: 'Test Brand X', slug: 'test-brand-x' })
}, 30000)

afterAll(async () => {
  await mongoose.connection.dropDatabase().catch(() => {})
  await disconnectFromDatabase()
  if (mem) await mem.stop()
})

describe('search', () => {
  it('returns arrays', async () => {
    const res = await request(app).get('/api/search').query({ q: 'test' }).expect(200)
    expect(Array.isArray(res.body.brands)).toBe(true)
    expect(Array.isArray(res.body.designers)).toBe(true)
    expect(Array.isArray(res.body.products)).toBe(true)
  })
})