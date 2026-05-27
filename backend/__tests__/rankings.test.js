const request = require('supertest')
const { createApp } = require('../src/app')
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db')
const { Product } = require('../models/productModel')
const { Click } = require('../models/clickModel')
const { Vote } = require('../models/voteModel')

const app = createApp()

describe('rankings', () => {
  beforeAll(async () => {
    process.env.MONGODB_IN_MEMORY = 'true'
    await connectToDatabase({ maxRetries: 1 })
    const product = await Product.create({
      source: 'test-rankings',
      sourceId: 'ranking-1',
      canonicalUrl: 'https://example.com/ranking-1',
      title: 'Ranking Product',
      brand: 'Ranking Brand',
      price: { value: 300, currency: 'USD' },
      images: ['https://example.com/ranking.jpg'],
      description: 'Ranking-ready product.',
    })
    await Click.create({ productId: product._id, url: product.canonicalUrl, source: 'product' })
    await Vote.create({ entityType: 'product', entityId: product._id, weight: 1 })
  }, 30000)

  afterAll(async () => {
    await disconnectFromDatabase()
  }, 30000)

  it('GET /api/rankings returns items', async () => {
    const res = await request(app).get('/api/rankings').expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
    expect(res.body.items[0]).toMatchObject({
      type: 'product',
      title: 'Ranking Product',
      brand: 'Ranking Brand',
      image: 'https://example.com/ranking.jpg',
    })
    expect(res.body.items[0].price.value).toBe(300)
    expect(res.body.items[0].score).toBeGreaterThan(0)
  })
  it('GET /api/rankings/mostLiked returns items', async () => {
    const res = await request(app).get('/api/rankings/mostLiked').expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
    expect(res.body.items[0]).toMatchObject({
      type: 'product',
      title: 'Ranking Product',
      brand: 'Ranking Brand',
    })
  })
  it('GET /api/rankings/mostViewed returns items', async () => {
    const res = await request(app).get('/api/rankings/mostViewed').expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
    expect(res.body.items[0]).toMatchObject({
      type: 'product',
      title: 'Ranking Product',
      brand: 'Ranking Brand',
    })
    expect(res.body.items[0].clicks).toBe(1)
  })
  it('GET /api/rankings/recentVotes returns items', async () => {
    const res = await request(app).get('/api/rankings/recentVotes').expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
    expect(res.body.items[0]).toMatchObject({
      type: 'product',
      title: 'Ranking Product',
      brand: 'Ranking Brand',
    })
  })
})
