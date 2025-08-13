const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
  const { type, links } = req.body || {}
  if (!type || !links) return res.status(400).json({ error: 'Missing fields' })
  res.json({ ok: true })
})

module.exports = router