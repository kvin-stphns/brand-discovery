const express = require('express')
const router = express.Router()
const { Product } = require('../models/productModel')
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
    }),
  }),
  async (req, res) => {
    const { brandId, designerId, q, sort, page, limit } = req.query
    const filter = {}
    if (brandId) filter.brandId = brandId
    if (designerId) filter.designerId = designerId
    if (q) filter.name = { $regex: q, $options: 'i' }
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

module.exports = router