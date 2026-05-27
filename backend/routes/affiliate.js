const express = require('express')
const crypto = require('crypto')
const router = express.Router()
const { Product } = require('../models/productModel')
const { Click } = require('../models/clickModel')
const { resolveAffiliateUrl } = require('../src/affiliate/linkResolver')

const CLICK_SOURCES = new Set(['featured', 'popular', 'grid', 'product', 'affiliate', 'checkout'])

function normalizeClickSource(value, fallback) {
  const source = String(value || fallback)
  return CLICK_SOURCES.has(source) ? source : fallback
}

router.get('/preview', async (req, res) => {
  const { productId, url, source: uiSource, utm } = req.query
  if (!productId && !url) return res.status(400).json({ error: 'Missing productId' })
  if (!productId && url) {
    const affiliateUrl = resolveAffiliateUrl({ canonicalUrl: String(url) }, normalizeClickSource(uiSource, 'affiliate'), String(utm || 'mvp'))
    return res.json({ affiliateUrl, canonicalUrl: String(url), url: affiliateUrl })
  }
  const product = await Product.findById(productId).lean().exec()
  if (!product) return res.status(404).json({ error: 'Not found' })

  const affiliateUrl = resolveAffiliateUrl(product, normalizeClickSource(uiSource, 'affiliate'), String(utm || 'mvp'))
  res.json({
    _id: String(product._id),
    productId: String(product._id),
    title: product.title || '',
    brand: product.brand || '',
    price: product.price || null,
    canonicalUrl: product.canonicalUrl || null,
    affiliateUrl,
    image: Array.isArray(product.images) && product.images.length ? product.images[0] : null,
    images: Array.isArray(product.images) ? product.images : [],
    source: product.source,
    sourceId: product.sourceId,
    retailer: product.retailer || null,
  })
})

router.get('/checkout', async (req, res) => {
  const { productId, source: uiSource, utm, url } = req.query
  const clickSource = normalizeClickSource(uiSource, 'checkout')

  if (!productId && !url) return res.status(400).json({ error: 'Missing productId' })
  if (!productId && url) {
    const targetUrl = resolveAffiliateUrl({ canonicalUrl: String(url) }, clickSource, String(utm || 'mvp'))
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
      const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
      if (Click.db.readyState === 1) {
        await Click.create({
          source: clickSource,
          url: targetUrl,
          userAgent: req.headers['user-agent'] || '',
          utm: String(utm || ''),
          ipHash,
        })
      }
    } catch (_e) {
      // non-blocking
    }
    return res.redirect(302, targetUrl)
  }

  const product = await Product.findById(productId).lean().exec()
  if (!product) return res.status(404).json({ error: 'Not found' })

  const targetUrl = resolveAffiliateUrl(product, clickSource, String(utm || 'mvp'))

  // Log click (idempotent enough; analytics only)
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
    const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
    await Click.create({
      productId: product._id,
      // ui/source context retained in existing schema as 'source'
      source: clickSource,
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
