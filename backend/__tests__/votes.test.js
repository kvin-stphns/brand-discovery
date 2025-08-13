const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { createApp } = require('../src/app')
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db')
const { Vote } = require('../models/voteModel')

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

describe('votes', () => {
  it('POST /api/votes returns 201 and stores vote', async () => {
    const entityId = new mongoose.Types.ObjectId().toHexString()
    const res = await request(app)
      .post('/api/votes')
      .send({ entityType: 'brand', entityId, weight: 2, source: 'web2' })
      .expect(201)
    expect(res.body._id).toBeTruthy()
    const saved = await Vote.findById(res.body._id)
    expect(saved.weight).toBe(2)
  })

  it('GET /api/votes/summary aggregates counts and weights', async () => {
    const entityId = new mongoose.Types.ObjectId()
    await Vote.create({ entityType: 'brand', entityId, weight: 1, source: 'web2' })
    await Vote.create({ entityType: 'brand', entityId, weight: 3, source: 'web2' })
    const res = await request(app)
      .get('/api/votes/summary')
      .query({ entityType: 'brand', entityId: entityId.toHexString() })
      .expect(200)
    expect(res.body.count).toBe(2)
    expect(res.body.weightedScore).toBe(4)
  })
})