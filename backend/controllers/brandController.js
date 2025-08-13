const { Brand } = require('../models/brandModel')

async function listBrands(req, res) {
  const { q, sort = '-createdAt', limit = 20, page = 1 } = req.query
  const filter = q ? { name: { $regex: q, $options: 'i' } } : {}
  const docs = await Brand.find(filter)
    .sort(sort)
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

async function createBrand(req, res) {
  const payload = req.body
  const created = await Brand.create(payload)
  res.status(201).json(created)
}

async function updateBrand(req, res) {
  const { id } = req.params
  const payload = req.body
  const updated = await Brand.findByIdAndUpdate(id, payload, { new: true })
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
}

module.exports = { listBrands, getBrand, createBrand, updateBrand } 