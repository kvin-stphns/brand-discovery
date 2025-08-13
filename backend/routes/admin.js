const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

router.get('/status', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '..', 'utils', 'sample-products.json')
    let products = []
    if (fs.existsSync(dataPath)) {
      products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    }
    const sources = products.reduce((acc, p) => {
      const s = p.source || 'other'
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {})
    const counts = { brands: 0, designers: 0, products: products.length, votes: 0, clicks: 0 }
    res.json({ ok: true, counts, sources: { farfetch: sources.farfetch || 0, ssense: sources.ssense || 0, other: sources.other || 0 } })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

module.exports = router