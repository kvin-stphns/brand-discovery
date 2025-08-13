const express = require('express')
const crypto = require('crypto')
const router = express.Router()

router.get('/redirect', async (req, res) => {
  const { productId, url } = req.query
  if (!productId || !url) return res.status(400).json({ error: 'Missing params' })
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  const ipHash = crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
  // TODO: persist Click in DB; for MVP we log
  // eslint-disable-next-line no-console
  console.log('[affiliate]', { productId, ipHash, ts: Date.now() })
  res.redirect(302, String(url))
})

module.exports = router