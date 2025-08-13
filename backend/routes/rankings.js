const express = require('express')
const router = express.Router()
const { Vote } = require('../models/voteModel')
const { Click } = require('../models/clickModel')

router.get('/', async (_req, res) => {
  const items = Array.from({ length: 10 }).map((_, i) => ({
    rank: i + 1,
    score: 100 - i * 3,
    id: `brand-${i + 1}`,
    name: `Brand ${i + 1}`,
  }))
  res.json({ items })
})

router.get('/mostLiked', async (_req, res) => {
  const pipeline = [
    { $match: { entityType: 'brand' } },
    { $group: { _id: '$entityId', score: { $sum: '$weight' }, count: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 20 },
  ]
  const items = await Vote.aggregate(pipeline)
  res.json({ items })
})

router.get('/mostViewed', async (_req, res) => {
  const pipeline = [
    { $group: { _id: '$url', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]
  const items = await Click.aggregate(pipeline)
  res.json({ items })
})

router.get('/recentVotes', async (_req, res) => {
  const items = await Vote.find({}).sort({ createdAt: -1 }).limit(50)
  res.json({ items })
})

module.exports = router