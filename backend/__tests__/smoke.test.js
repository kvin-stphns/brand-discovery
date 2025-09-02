/* eslint-disable no-undef */
require('dotenv').config()
const request = require('supertest')
const { createApp } = require('../src/app')
const { connectToDatabase, disconnectFromDatabase } = require('../utils/db')
const { Product } = require('../models/productModel')

describe('API smoke', () => {
  let app
  beforeAll(async () => {
    process.env.MONGODB_IN_MEMORY = 'true'
    await connectToDatabase({ maxRetries: 1 })
    app = createApp()
  })

  afterAll(async () => {
    await disconnectFromDatabase()
  })

  test('admin status returns ok', async () => {
    const res = await request(app).get('/api/admin/status')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ok', true)
  })

  test('products list and affiliate checkout', async () => {
    // insert one product
    const p = await Product.create({
      source: 'other',
      sourceId: 'test-1',
      canonicalUrl: 'https://example.com/product/1',
      title: 'Test Product',
      brand: 'Test Brand',
      price: { value: 123, currency: 'USD' },
      images: ['https://example.com/img.jpg'],
    })

    const list = await request(app).get('/api/products?limit=1')
    expect(list.status).toBe(200)
    expect(Array.isArray(list.body.items)).toBe(true)
    expect(list.body.items.length).toBeGreaterThanOrEqual(1)

    const prev = await request(app).get(`/api/affiliate/preview?productId=${p._id}`)
    expect(prev.status).toBe(200)
    expect(prev.body).toHaveProperty('title', 'Test Product')
    expect(prev.body).toHaveProperty('affiliateUrl')

    const redir = await request(app).get(`/api/affiliate/checkout?productId=${p._id}`).redirects(0)
    expect([302, 307]).toContain(redir.status)
    expect(redir.headers).toHaveProperty('location')
  })
})

