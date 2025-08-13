const express = require('express')
const router = express.Router()
const { Product } = require('../models/productModel')
<<<<<<< HEAD
const { validate, Joi } = require('../src/middleware/validate')

router.get(
  '/',
  validate({
    query: Joi.object({
      brandId: Joi.string().length(24).hex().optional(),
      designerId: Joi.string().length(24).hex().optional(),
      q: Joi.string().optional(),
      sort: Joi.string().default('-createdAt'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      source: Joi.string().optional(),
    }),
  }),
  async (req, res) => {
    const { brandId, designerId, q, sort, page, limit, source } = req.query
    const filter = {}
    if (brandId) filter.brandId = brandId
    if (designerId) filter.designerId = designerId
    if (q) filter.name = { $regex: q, $options: 'i' }
    if (source) filter.source = { $in: String(source).split(',').map((s) => s.trim()) }
    const docs = await Product.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
    res.json({ items: docs })
  }
)

router.get(
  '/:id',
  validate({ params: Joi.object({ id: Joi.string().length(24).hex().required() }) }),
  async (req, res) => {
    const doc = await Product.findById(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  }
)
=======

router.get('/', async (req, res) => {
  const { brandId, designerId, q, sort = 'recent', source, limit = 20, page = 1 } = req.query
  const filter = {}
  if (brandId) filter.brandId = brandId
  if (designerId) filter.designerId = designerId
  if (source) filter.source = source
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { brand: { $regex: q, $options: 'i' } },
    { designer: { $regex: q, $options: 'i' } },
  ]

  const pageSize = Math.min(Number(limit), 100)
  const cursor = Product.find(filter)
    .sort(sort === 'price' ? { price: 1 } : { createdAt: -1 })
    .limit(pageSize)
    .skip((Number(page) - 1) * pageSize)

  const [items, total] = await Promise.all([
    cursor.exec(),
    Product.countDocuments(filter),
  ])
  res.json({ items, total })
})

router.get('/:id', async (req, res) => {
  const doc = await Product.findById(req.params.id)
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)

module.exports = router