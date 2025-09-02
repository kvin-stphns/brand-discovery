const express = require('express')
const crypto = require('crypto')
const router = express.Router()
const { Product } = require('../models/productModel')
const { Click } = require('../models/clickModel')
const { resolveAffiliateUrl } = require('../src/affiliate/linkResolver')

router.get('/preview', async (req, res) => {
  const { productId } = req.query
  if (!productId) return res.status(400).json({ error: 'Missing productId' })
  const product = await Product.findById(productId).lean().exec()
  if (!product) return res.status(404).json({ error: 'Not found' })

  const affiliateUrl = resolveAffiliateUrl(product, 'affiliate', 'mvp')
  res.json({
    _id: product._id,
    title: product.title,
    brand: product.brand,
    price: product.price || null,
    canonicalUrl: product.canonicalUrl || null,
    affiliateUrl,
    image: Array.isArray(product.images) && product.images.length ? product.images[0] : null,
    source: product.source,
    sourceId: product.sourceId,
  })
})

router.get('/checkout', async (req, res) => {
  const { productId, source: uiSource, utm } = req.query

  if (!productId) return res.status(400).json({ error: 'Missing productId' })

  const product = await Product.findById(productId).lean().exec()
  if (!product) return res.status(404).json({ error: 'Not found' })

  const targetUrl = resolveAffiliateUrl(product, String(uiSource || 'checkout'), String(utm || 'mvp'))

  // Log click (idempotent enough; analytics only)
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
    const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
    await Click.create({
      productId: product._id,
      // ui/source context retained in existing schema as 'source'
      source: String(uiSource || 'checkout'),
      productSource: product.source,
      sourceId: product.sourceId,
      url: targetUrl,
      userAgent: req.headers['user-agent'] || '',
      utm: String(utm || ''),
      ipHash,
    })
  } catch (_e) {
    // non-blocking
  }

  return res.redirect(302, targetUrl)
})

module.exports = router
