const express = require('express')
const router = express.Router()
const { Vote } = require('../models/voteModel')
const { validate, Joi } = require('../src/middleware/validate')

router.post(
  '/',
  validate({
    body: Joi.object({
      userId: Joi.string().length(24).hex().optional(),
      entityType: Joi.string().valid('brand', 'designer', 'product').required(),
      entityId: Joi.string().length(24).hex().required(),
      weight: Joi.number().integer().min(1).max(10).default(1),
      source: Joi.string().valid('web2', 'web3').default('web2'),
      txHash: Joi.string().optional(),
    }),
  }),
  async (req, res) => {
    const created = await Vote.create({
      ...req.body,
    })
    res.status(201).json(created)
  }
)

router.get(
  '/summary',
  validate({ query: Joi.object({ entityType: Joi.string().valid('brand', 'designer', 'product').required(), entityId: Joi.string().length(24).hex().required() }) }),
  async (req, res) => {
    const { entityType, entityId } = req.query
    const [summary] = await Vote.aggregate([
      { $match: { entityType, entityId: new (require('mongoose').Types.ObjectId)(entityId) } },
      {
        $group: {
          _id: '$entityId',
          count: { $sum: 1 },
          weight: { $sum: '$weight' },
        },
      },
    ])
    res.json({ ok: true, count: summary?.count || 0, weightedScore: summary?.weight || 0 })
  }
)

module.exports = router