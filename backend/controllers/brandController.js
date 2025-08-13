const { Brand } = require('../models/brandModel')

async function listBrands(req, res) {
  const { q, limit = 20, page = 1 } = req.query
  const filter = q ? { name: { $regex: q, $options: 'i' } } : {}
  const docs = await Brand.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit), 100))
    .skip((Number(page) - 1) * Number(limit))
  res.json({ items: docs })
}

async function getBrand(req, res) {
  const { id } = req.params
  const doc = await Brand.findById(id)
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
}

module.exports = { listBrands, getBrand } 