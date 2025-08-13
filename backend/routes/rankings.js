const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const items = Array.from({ length: 10 }).map((_, i) => ({
    rank: i + 1,
    score: 100 - i * 3,
    id: `brand-${i + 1}`,
    name: `Brand ${i + 1}`,
  }))
  res.json({ items })
})

module.exports = router