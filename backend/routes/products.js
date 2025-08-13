const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

function loadProducts() {
  const dataPath = path.join(__dirname, '..', 'utils', 'sample-products.json')
  if (!fs.existsSync(dataPath)) return []
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
}

router.get('/', async (req, res) => {
  const { brandId, designerId, q, sort, source, limit = 20, page = 1 } = req.query
  let items = loadProducts()
  if (source) items = items.filter((p) => String(p.source) === String(source))
  if (q) {
    const re = new RegExp(String(q), 'i')
    items = items.filter((p) => re.test(p.name) || re.test(p.brand))
  }
  const total = items.length
  const pageSize = Math.min(Number(limit), 100)
  const paged = items.slice((Number(page) - 1) * pageSize, (Number(page) - 1) * pageSize + pageSize)
  res.json({ items: paged, total })
})

router.get('/:id', async (req, res) => {
  const items = loadProducts()
  const found = items.find((p) => String(p._id) === String(req.params.id))
  if (!found) return res.status(404).json({ error: 'Not found' })
  res.json(found)
})

module.exports = router