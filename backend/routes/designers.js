const express = require('express')
const router = express.Router()
const { Designer } = require('../models/designerModel')
const { authRequired, adminOnly } = require('../src/middleware/auth')
const { validate, Joi } = require('../src/middleware/validate')

router.get('/', async (req, res) => {
  const { q, sort = '-createdAt', limit = 20, page = 1 } = req.query
  const filter = q ? { name: { $regex: q, $options: 'i' } } : {}
  const docs = await Designer.find(filter)
    .sort(sort)
    .limit(Math.min(Number(limit), 100))
    .skip((Number(page) - 1) * Number(limit))
  res.json({ items: docs })
})

router.get(
  '/:id',
  validate({ params: Joi.object({ id: Joi.string().length(24).hex().required() }) }),
  async (req, res) => {
    const doc = await Designer.findById(req.params.id)
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  }
)

router.post(
  '/',
  authRequired,
  adminOnly,
  validate({ body: Joi.object({ name: Joi.string().required(), slug: Joi.string().required(), image: Joi.string().uri().optional(), url: Joi.string().uri().optional() }) }),
  async (req, res) => {
    const created = await Designer.create(req.body)
    res.status(201).json(created)
  }
)

router.patch(
  '/:id',
  authRequired,
  adminOnly,
  validate({ params: Joi.object({ id: Joi.string().length(24).hex().required() }), body: Joi.object({ name: Joi.string(), slug: Joi.string(), image: Joi.string().uri(), url: Joi.string().uri() }).min(1) }),
  async (req, res) => {
    const updated = await Designer.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  }
)

module.exports = router