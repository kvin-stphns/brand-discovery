const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Product } = require('../models/productModel');
const { Vote } = require('../models/voteModel');
const { Click } = require('../models/clickModel');

/**
 * GET /api/rankings
 * Returns a simple, DB-backed ranking list.
 * - default: newest products first mapped into ranked rows
 * - supports ?limit=NUMBER (1..100)
 * NOTE: This is a placeholder until a real popularity score (votes/clicks) is aggregated.
 */
router.get('/', async (req, res) => {
  const { limit = 20 } = req.query;

  if (mongoose.connection.readyState !== 1) {
    return res.json({ items: [] });
  }

  const size = Math.max(1, Math.min(100, Number(limit)));
  const items = await Product.find({})
    .sort({ createdAt: -1 })
    .limit(size)
    .lean()
    .exec();

  const rows = items.map((p, idx) => {
    const clean = (s) => String(s || '')
      .replace(/\{[^}]*\}/g, ' ')
      .replace(/var\([^)]*\)/g, ' ')
      .replace(/\.ltr-[\w:-]+/gi, ' ')
      .replace(/:(hover|focus|active)/gi, ' ')
      .replace(/\s+/g, ' ').trim()
    const name = clean(p.brand ? `${p.brand} ${p.title || ''}` : (p.title || ''))
    return {
      rank: idx + 1,
      score: 100 - idx, // placeholder score until we wire real popularity
      id: String(p._id),
      name,
    }
  });

  res.json({ items: rows });
});

/**
 * GET /api/rankings/mostLiked
 * Aggregates votes to surface top brands by score.
 * (Adjust entityType to 'product' if you prefer product-level rankings.)
 */
router.get('/mostLiked', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const pipeline = [
    { $match: { entityType: 'brand' } },
    { $group: { _id: '$entityId', score: { $sum: '$weight' }, count: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 20 },
  ];

  const items = await Vote.aggregate(pipeline);
  res.json({ items });
});

/**
 * GET /api/rankings/mostViewed
 * Aggregates click logs; groups by URL (or switch to productId if you log it).
 */
router.get('/mostViewed', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const pipeline = [
    { $group: { _id: '$url', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ];

  const items = await Click.aggregate(pipeline);
  res.json({ items });
});

/**
 * GET /api/rankings/recentVotes
 * Returns the most recent votes.
 */
router.get('/recentVotes', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const items = await Vote.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()
    .exec();

  res.json({ items });
});

module.exports = router;
