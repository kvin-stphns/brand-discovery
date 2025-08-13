const express = require('express')
const router = express.Router()
const { Brand } = require('../models/brandModel')
const { Designer } = require('../models/designerModel')
const { Product } = require('../models/productModel')
const { Vote } = require('../models/voteModel')
const { Click } = require('../models/clickModel')

router.get('/status', async (req, res) => {
  try {
    const [brands, designers, products, votes, clicks] = await Promise.all([
      Brand.countDocuments({}),
      Designer.countDocuments({}),
      Product.countDocuments({}),
      Vote.countDocuments({}),
      Click.countDocuments({}),
    ])

    const bySource = await Product.aggregate([
      { $group: { _id: '$source', n: { $sum: 1 } } },
    ])
    const sources = bySource.reduce((acc, row) => { acc[row._id] = row.n; return acc }, {})

    res.json({ ok: true, counts: { brands, designers, products, votes, clicks }, sources: { farfetch: sources.farfetch || 0, ssense: sources.ssense || 0, other: sources.other || 0 } })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

module.exports = router