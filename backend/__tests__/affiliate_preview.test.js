const request = require('supertest')
const { createApp } = require('../src/app')

const app = createApp()

describe('affiliate preview', () => {
  it('GET /api/affiliate/preview returns url', async () => {
    const res = await request(app).get('/api/affiliate/preview').query({ url: 'https://example.com/x' }).expect(200)
    expect(res.body.url).toMatch(/^https:\/\/example.com\/x/)
  })
})