const express = require('express')
const crypto = require('crypto')
const mongoose = require('mongoose')
const router = express.Router()
const { Click } = require('../models/clickModel')

function composeOutboundUrl(url, source = 'grid', utm) {
  try {
    const u = new URL(String(url))
    // MVP: passthrough, append basic partner params if not present
    if (utm) u.searchParams.set('utm_source', utm)
    u.searchParams.set('ref', process.env.AFFILIATE_REF || 'partner')
    return u.toString()
  } catch (_e) {
    return String(url)
  }
}

router.get('/checkout', async (req, res) => {
  const { productId, url, source = 'grid', utm } = req.query
  if (!url) return res.status(400).json({ error: 'Missing url' })

  const outbound = composeOutboundUrl(url, source, utm)

  // Non-blocking Click log; only if DB is connected
  ;(async () => {
    try {
      if (mongoose.connection.readyState !== 1) return
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
      const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
      await Click.create({ productId: productId || undefined, url: String(url), source: String(source || 'grid'), utm: utm ? String(utm) : undefined, ipHash })
    } catch (e) {
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.warn('[affiliate click log failed]', e.message)
      }
    }
  })()

  res.redirect(302, outbound)
})

module.exports = router