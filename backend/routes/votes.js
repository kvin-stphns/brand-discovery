const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
  // store web2 vote; on-chain relay added later
  const { entityType, entityId, weight = 1 } = req.body || {}
  if (!entityType || !entityId) return res.status(400).json({ error: 'Missing fields' })
  res.json({ ok: true, entityType, entityId, weight })
})

module.exports = router