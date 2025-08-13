const request = require('supertest')
const { createApp } = require('../src/app')

process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

const app = createApp()

describe('checkout redirect', () => {
  it('GET /api/affiliate/checkout redirects 302', async () => {
    const res = await request(app)
      .get('/api/affiliate/checkout')
      .query({ url: 'https://example.com/product', source: 'grid' })
      .expect(302)
    expect(res.headers.location).toMatch(/^https:\/\/example.com\/product/)
  })
})