const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Product } = require('../models/productModel');
const { Vote } = require('../models/voteModel');
const { Click } = require('../models/clickModel');

/**
 * GET /api/rankings
 * Returns a DB-backed product ranking list.
 * - supports ?limit=NUMBER (1..100)
 */
router.get('/', async (req, res) => {
  const { limit = 20, gender } = req.query;

  if (mongoose.connection.readyState !== 1) {
    return res.json({ items: [] });
  }

  const filter = { 'dataQuality.score': { $gte: 4 } };
  if (gender) filter.gender = gender;

  const size = Math.max(1, Math.min(100, Number(limit)));
  const products = await Product.find(filter)
    .sort({ 'dataQuality.score': -1, createdAt: -1 })
    .limit(Math.max(size, 60))
    .lean()
    .exec();

  const ids = products.map((p) => p._id);
  const [clickRows, voteRows] = await Promise.all([
    Click.aggregate([
      { $match: { productId: { $in: ids } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]),
    Vote.aggregate([
      { $match: { entityType: 'product', entityId: { $in: ids } } },
      { $group: { _id: '$entityId', score: { $sum: '$weight' }, count: { $sum: 1 } } },
    ]),
  ]);
  const clickMap = new Map(clickRows.map((row) => [String(row._id), row.count]));
  const voteMap = new Map(voteRows.map((row) => [String(row._id), row.score]));

  const rows = products
    .map((p) => {
      const clicks = clickMap.get(String(p._id)) || 0;
      const votes = voteMap.get(String(p._id)) || 0;
      const quality = p.dataQuality?.score || 0;
      const recency = p.createdAt ? Math.max(0, 20 - Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000)) : 0;
      return { product: p, score: clicks * 10 + votes * 6 + quality * 4 + recency, clicks, votes };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, size)
    .map(({ product: p, score, clicks, votes }, idx) => ({
    rank: idx + 1,
    score,
    id: String(p._id),
    type: 'product',
    name: p.brand ? `${p.brand} ${p.title || ''}`.trim() : (p.title || ''),
    title: p.title || '',
    brand: p.brand || '',
    retailer: p.retailer || '',
    image: Array.isArray(p.images) ? p.images[0] || '' : '',
    price: p.price || null,
    clicks,
    votes,
  }));

  res.json({ items: rows });
});

/**
 * GET /api/rankings/mostLiked
 * Aggregates votes to surface top products by score.
 */
router.get('/mostLiked', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const pipeline = [
    { $match: { entityType: 'product' } },
    { $group: { _id: '$entityId', score: { $sum: '$weight' }, count: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 20 },
  ];

  const rows = await Vote.aggregate(pipeline);
  const products = await Product.find({ _id: { $in: rows.map((row) => row._id) }, 'dataQuality.score': { $gte: 4 } }).lean().exec();
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const items = rows
    .map((row, idx) => {
      const p = productMap.get(String(row._id));
      if (!p) return null;
      return {
        rank: idx + 1,
        id: String(p._id),
        type: 'product',
        name: p.brand ? `${p.brand} ${p.title || ''}`.trim() : p.title,
        image: Array.isArray(p.images) ? p.images[0] || '' : '',
        score: row.score,
        count: row.count,
      };
    })
    .filter(Boolean);
  res.json({ items });
});

/**
 * GET /api/rankings/mostViewed
 * Aggregates click logs by product.
 */
router.get('/mostViewed', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const pipeline = [
    { $match: { productId: { $ne: null } } },
    { $group: { _id: '$productId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ];

  const rows = await Click.aggregate(pipeline);
  const products = await Product.find({ _id: { $in: rows.map((row) => row._id) }, 'dataQuality.score': { $gte: 4 } }).lean().exec();
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const items = rows
    .map((row, idx) => {
      const p = productMap.get(String(row._id));
      if (!p) return null;
      return {
        rank: idx + 1,
        id: String(p._id),
        type: 'product',
        name: p.brand ? `${p.brand} ${p.title || ''}`.trim() : p.title,
        image: Array.isArray(p.images) ? p.images[0] || '' : '',
        count: row.count,
      };
    })
    .filter(Boolean);
  res.json({ items });
});

/**
 * GET /api/rankings/recentVotes
 * Returns the most recent votes.
 */
router.get('/recentVotes', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const votes = await Vote.find({ entityType: 'product' })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()
    .exec();

  const products = await Product.find({ _id: { $in: votes.map((vote) => vote.entityId) }, 'dataQuality.score': { $gte: 4 } }).lean().exec();
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const items = votes.map((vote, idx) => {
    const p = productMap.get(String(vote.entityId));
    return {
      rank: idx + 1,
      id: String(vote.entityId),
      type: 'product',
      name: p ? `${p.brand ? `${p.brand} ` : ''}${p.title || ''}`.trim() : String(vote.entityId),
      image: p && Array.isArray(p.images) ? p.images[0] || '' : '',
      entityType: vote.entityType,
      weight: vote.weight,
    };
  });

  res.json({ items });
});

module.exports = router;
