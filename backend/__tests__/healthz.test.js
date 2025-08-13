const request = require('supertest')
const { createApp } = require('../src/app')

describe('healthz', () => {
  it('GET /healthz returns ok', async () => {
    const app = createApp()
    const res = await request(app).get('/healthz').expect(200)
    expect(res.body.ok).toBe(true)
    expect(typeof res.body.uptime).toBe('number')
  })
})