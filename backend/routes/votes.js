const express = require('express')
const router = express.Router()
const { Vote } = require('../models/voteModel')
const { validate, Joi } = require('../src/middleware/validate')
const { vote: web3Vote } = require('../src/web3/voting')

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
      walletAddress: Joi.string().optional(),
    }),
  }),
  async (req, res) => {
    const created = await Vote.create({
      ...req.body,
    })

    // Fire-and-forget on-chain vote if wallet provided
    if (req.body.source === 'web3' && req.body.walletAddress) {
      ;(async () => {
        const { txHash } = await web3Vote({
          rpcUrl: process.env.NEON_RPC_URL,
          privateKey: process.env.WEB3_PRIVATE_KEY,
          contractAddress: process.env.VOTING_CONTRACT_ADDRESS,
          entityId: 1, // placeholder mapping; real mapping would correlate entity ObjectId to numeric id
          weight: req.body.weight || 1,
        })
        try {
          await Vote.findByIdAndUpdate(created._id, { txHash })
        } catch (_e) {}
      })()
    }

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