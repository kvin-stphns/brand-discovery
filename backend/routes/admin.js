const express = require('express')
const router = express.Router()
const { Brand } = require('../models/brandModel')
const { Designer } = require('../models/designerModel')
const { Product } = require('../models/productModel')
const { Vote } = require('../models/voteModel')
const { Click } = require('../models/clickModel')
const { Retailer } = require('../models/retailerModel')
const { FeedSource } = require('../models/feedSourceModel')
const { FeedImportLog } = require('../models/feedImportLogModel')

router.get('/status', async (req, res) => {
  try {
    const [brands, designers, products, displayReadyProducts, lowQualityProducts, retailers, feedSources, feedImports, votes, clicks] = await Promise.all([
      Brand.countDocuments({}),
      Designer.countDocuments({}),
      Product.countDocuments({}),
      Product.countDocuments({ 'dataQuality.score': { $gte: 4 } }),
      Product.countDocuments({ $or: [{ 'dataQuality.score': { $lt: 4 } }, { dataQuality: { $exists: false } }] }),
      Retailer.countDocuments({}),
      FeedSource.countDocuments({}),
      FeedImportLog.countDocuments({}),
      Vote.countDocuments({}),
      Click.countDocuments({}),
    ])

    const bySource = await Product.aggregate([
      { $group: { _id: '$source', n: { $sum: 1 } } },
    ])
    const sources = bySource.reduce((acc, row) => { acc[row._id] = row.n; return acc }, {})

    const latestImports = await FeedImportLog.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .exec()

    res.json({
      ok: true,
      counts: {
        brands,
        designers,
        products,
        displayReadyProducts,
        lowQualityProducts,
        retailers,
        feedSources,
        feedImports,
        votes,
        clicks,
      },
      sources,
      latestImports,
    })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

module.exports = router
