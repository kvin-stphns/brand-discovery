const express = require('express')
const crypto = require('crypto')
const router = express.Router()
const { Product } = require('../models/productModel')

router.get('/preview', async (req, res) => {
  const { productId } = req.query
  if (!productId) return res.status(400).json({ error: 'Missing productId' })
  const product = await Product.findById(productId)
  if (!product) return res.status(404).json({ error: 'Not found' })
  // Return structured preview for frontend rendering
  res.json({
    _id: product._id,
    name: product.name,
    brand: product.brand,
    price: { value: product.price, currency: product.currency },
    url: product.url,
    image: product.image,
  })
})

router.get('/checkout', async (req, res) => {
  const { productId } = req.query
  if (!productId) return res.status(400).json({ error: 'Missing productId' })
  const product = await Product.findById(productId)
  if (!product) return res.status(404).json({ error: 'Not found' })
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
  // eslint-disable-next-line no-console
  console.log('[affiliate:checkout]', { productId, ipHash, ts: Date.now() })
  const target = new URL(product.url)
  target.searchParams.set('utm_source', 'discovery')
  target.searchParams.set('utm_medium', 'affiliate')
  target.searchParams.set('pid', String(product._id))
  res.redirect(302, target.toString())
})

module.exports = router