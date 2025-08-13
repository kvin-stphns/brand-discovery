const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { createApp } = require('../src/app')
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db')
const { User } = require('../models/userModel')
const { signUserToken } = require('../src/middleware/auth')

const app = createApp()
let mem

beforeAll(async () => {
  mem = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mem.getUri()
  await connectToDatabase({ maxRetries: 1 })
}, 30000)

afterAll(async () => {
  await mongoose.connection.dropDatabase().catch(() => {})
  await disconnectFromDatabase()
  if (mem) await mem.stop()
})

describe('brands CRUD', () => {
  it('POST /api/brands (admin) then GET /api/brands contains it', async () => {
    const admin = await User.create({ email: 'admin@example.com', role: 'admin' })
    const token = signUserToken(admin)

    const payload = { name: 'Test Brand', slug: 'test-brand' }
    const createRes = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201)

    expect(createRes.body._id).toBeTruthy()

    const listRes = await request(app).get('/api/brands').expect(200)
    const names = listRes.body.items.map((b) => b.name)
    expect(names).toContain('Test Brand')
  })
})