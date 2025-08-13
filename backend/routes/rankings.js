const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const { Vote } = require('../models/voteModel')
const { Click } = require('../models/clickModel')
const mongoose = require('mongoose')

router.get('/', async (_req, res) => {
  const items = Array.from({ length: 10 }).map((_, i) => ({
    rank: i + 1,
    score: 100 - i * 3,
    id: `brand-${i + 1}`,
    name: `Brand ${i + 1}`,
  }))
  res.json({ items })
=======
const { Product } = require('../models/productModel')

router.get('/', async (req, res) => {
  const { limit = 20 } = req.query
  const items = await Product.find({}).sort({ createdAt: -1 }).limit(Math.min(Number(limit), 100))
  const rows = items.map((p, idx) => ({ rank: idx + 1, score: 100 - idx, id: String(p._id), name: p.brand ? `${p.brand} ${p.name}` : p.name }))
  res.json({ items: rows })
>>>>>>> 6a9a98b (Add product scraping, database models, and MongoDB memory server support)
})

router.get('/mostLiked', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] })
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
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] })
  const pipeline = [
    { $group: { _id: '$url', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]
  const items = await Click.aggregate(pipeline)
  res.json({ items })
})

router.get('/recentVotes', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] })
  const items = await Vote.find({}).sort({ createdAt: -1 }).limit(50)
  res.json({ items })
})

module.exports = router