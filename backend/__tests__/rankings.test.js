const request = require('supertest')
const { createApp } = require('../src/app')

const app = createApp()

describe('rankings', () => {
  it('GET /api/rankings returns items', async () => {
    const res = await request(app).get('/api/rankings').expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
  })
  it('GET /api/rankings/mostLiked returns items', async () => {
    const res = await request(app).get('/api/rankings/mostLiked').expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
  })
  it('GET /api/rankings/mostViewed returns items', async () => {
    const res = await request(app).get('/api/rankings/mostViewed').expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
  })
  it('GET /api/rankings/recentVotes returns items', async () => {
    const res = await request(app).get('/api/rankings/recentVotes').expect(200)
    expect(Array.isArray(res.body.items)).toBe(true)
  })
})