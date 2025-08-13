const express = require('express')
const router = express.Router()
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

router.get('/', async (req, res) => {
  try {
    const u = String(req.query.u || '')
    if (!u || !/^https?:\/\//i.test(u)) return res.status(400).send('Bad url')
    const r = await fetch(u)
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    const buf = await r.arrayBuffer()
    res.send(Buffer.from(buf))
  } catch (e) {
    res.status(500).send('error')
  }
})

module.exports = router