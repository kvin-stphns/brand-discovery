const express = require('express')
const crypto = require('crypto')
const router = express.Router()

router.get('/preview', async (req, res) => {
  const { productId } = req.query
  if (!productId) return res.status(400).json({ error: 'Missing productId' })
  // For MVP, load from sample products
  const fs = require('fs')
  const path = require('path')
  const dataPath = path.join(__dirname, '..', 'utils', 'sample-products.json')
  const items = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf-8')) : []
  const product = items.find((p) => String(p._id) === String(productId))
  if (!product) return res.status(404).json({ error: 'Not found' })
  // Compose affiliate URL (stub: passthrough)
  res.json({ url: product.url })
})

router.get('/checkout', async (req, res) => {
  const { productId } = req.query
  if (!productId) return res.status(400).json({ error: 'Missing productId' })
  const fs = require('fs')
  const path = require('path')
  const dataPath = path.join(__dirname, '..', 'utils', 'sample-products.json')
  const items = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf-8')) : []
  const product = items.find((p) => String(p._id) === String(productId))
  if (!product) return res.status(404).json({ error: 'Not found' })
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
  // TODO: persist Click in DB; for MVP we log
  // eslint-disable-next-line no-console
  console.log('[affiliate:checkout]', { productId, ipHash, ts: Date.now() })
  res.redirect(302, String(product.url))
})

module.exports = router