const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Product } = require('../models/productModel');
const { Vote } = require('../models/voteModel');
const { Click } = require('../models/clickModel');

function getSinceDate(timeframe) {
  const now = Date.now();
  if (timeframe === '24h') return new Date(now - 24 * 60 * 60 * 1000);
  if (timeframe === '7d') return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (timeframe === '30d') return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function buildProductFilter(query = {}) {
  const filter = { 'dataQuality.score': { $gte: 4 } };
  if (query.gender) filter.gender = query.gender;
  if (query.category) {
    const categories = String(query.category)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (categories.length) filter.category = { $in: categories.map((value) => new RegExp(value, 'i')) };
  }
  return filter;
}

function toRankingItem(product, rank, metrics = {}) {
  const title = product.title || '';
  const brand = product.brand || '';
  return {
    rank,
    score: Number(metrics.score || 0),
    id: String(product._id),
    productId: String(product._id),
    type: 'product',
    name: brand ? `${brand} ${title}`.trim() : title,
    title,
    brand,
    retailer: product.retailer || '',
    image: Array.isArray(product.images) ? product.images[0] || '' : '',
    images: Array.isArray(product.images) ? product.images : [],
    price: product.price || null,
    clicks: Number(metrics.clicks || 0),
    votes: Number(metrics.votes || 0),
    count: Number(metrics.count || 0),
    weight: Number(metrics.weight || 0),
  };
}

/**
 * GET /api/rankings
 * Returns a DB-backed product ranking list.
 * - supports ?limit=NUMBER (1..100)
 */
router.get('/', async (req, res) => {
  const { limit = 20, timeframe } = req.query;

  if (mongoose.connection.readyState !== 1) {
    return res.json({ items: [] });
  }

  const filter = buildProductFilter(req.query);
  const size = Math.max(1, Math.min(100, Number(limit)));
  const since = getSinceDate(timeframe);
  const metricMatch = since ? { createdAt: { $gte: since } } : {};
  const products = await Product.find(filter)
    .sort({ 'dataQuality.score': -1, createdAt: -1 })
    .limit(Math.max(size, 60))
    .lean()
    .exec();

  const ids = products.map((p) => p._id);
  const [clickRows, voteRows] = await Promise.all([
    Click.aggregate([
      { $match: { ...metricMatch, productId: { $in: ids } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]),
    Vote.aggregate([
      { $match: { ...metricMatch, entityType: 'product', entityId: { $in: ids } } },
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
    .map(({ product, score, clicks, votes }, idx) => toRankingItem(product, idx + 1, { score, clicks, votes }));

  res.json({ items: rows });
});

/**
 * GET /api/rankings/mostLiked
 * Aggregates votes to surface top products by score.
 */
router.get('/mostLiked', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const since = getSinceDate(req.query.timeframe);
  const voteMatch = since ? { createdAt: { $gte: since } } : {};
  const pipeline = [
    { $match: { ...voteMatch, entityType: 'product' } },
    { $group: { _id: '$entityId', score: { $sum: '$weight' }, count: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 20 },
  ];

  const rows = await Vote.aggregate(pipeline);
  const products = await Product.find({ ...buildProductFilter(req.query), _id: { $in: rows.map((row) => row._id) } }).lean().exec();
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const items = rows
    .map((row) => {
      const p = productMap.get(String(row._id));
      if (!p) return null;
      return { product: p, metrics: { score: row.score, votes: row.score, count: row.count } };
    })
    .filter(Boolean)
    .map(({ product, metrics }, idx) => toRankingItem(product, idx + 1, metrics));
  res.json({ items });
});

/**
 * GET /api/rankings/mostViewed
 * Aggregates click logs by product.
 */
router.get('/mostViewed', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const since = getSinceDate(req.query.timeframe);
  const clickMatch = since ? { createdAt: { $gte: since } } : {};
  const pipeline = [
    { $match: { ...clickMatch, productId: { $ne: null } } },
    { $group: { _id: '$productId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ];

  const rows = await Click.aggregate(pipeline);
  const products = await Product.find({ ...buildProductFilter(req.query), _id: { $in: rows.map((row) => row._id) } }).lean().exec();
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const items = rows
    .map((row) => {
      const p = productMap.get(String(row._id));
      if (!p) return null;
      return { product: p, metrics: { score: row.count, clicks: row.count, count: row.count } };
    })
    .filter(Boolean)
    .map(({ product, metrics }, idx) => toRankingItem(product, idx + 1, metrics));
  res.json({ items });
});

/**
 * GET /api/rankings/recentVotes
 * Returns the most recent votes.
 */
router.get('/recentVotes', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ items: [] });

  const since = getSinceDate(req.query.timeframe);
  const voteFilter = since ? { createdAt: { $gte: since } } : {};
  const votes = await Vote.find({ ...voteFilter, entityType: 'product' })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()
    .exec();

  const products = await Product.find({ ...buildProductFilter(req.query), _id: { $in: votes.map((vote) => vote.entityId) } }).lean().exec();
  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const items = votes
    .map((vote) => {
      const p = productMap.get(String(vote.entityId));
      if (!p) return null;
      return { product: p, vote };
    })
    .filter(Boolean)
    .map(({ product, vote }, idx) => ({
      ...toRankingItem(product, idx + 1, { score: vote.weight, votes: vote.weight, weight: vote.weight }),
      entityType: vote.entityType,
    }));

  res.json({ items });
});

module.exports = router;
