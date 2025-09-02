const express = require('express');
const router = express.Router();
const { Product } = require('../models/productModel');

// Optional validate middleware (kept for compatibility). If it doesn't exist in your tree, you can remove these two lines.
let validate, Joi;
try {
  ({ validate, Joi } = require('../src/middleware/validate'));
} catch {
  validate = (cfg) => (req, _res, next) => next();
  Joi = require('joi');
}

/**
 * GET /api/products
 * Query params:
 *  - brandId, designerId: 24-char hex ObjectId
 *  - q: text search against title/brand
 *  - source: "farfetch", "ssense" or comma-separated list
 *  - sort: "new" (default), "priceAsc", "priceDesc", "popular"
 *  - page: 1+
 *  - limit: 1..100
 */
router.get(
  '/',
  validate({
    query: Joi.object({
      brandId: Joi.string().length(24).hex().optional(),
      designerId: Joi.string().length(24).hex().optional(),
      q: Joi.string().optional(),
      source: Joi.string().optional(),
      sort: Joi.string().valid('new', 'priceAsc', 'priceDesc', 'popular').default('new'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
    }),
  }),
  async (req, res) => {
    const { brandId, designerId, q, source, sort, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (brandId) filter.brandId = brandId;
    if (designerId) filter.designerId = designerId;

    if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { brand: { $regex: q, $options: 'i' } }]

    if (source) {
      const list = String(source)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length === 1) filter.source = list[0];
      else if (list.length > 1) filter.source = { $in: list };
    }

    // Sorting
    let sortSpec = { createdAt: -1 }; // "new"
    if (sort === 'priceAsc') sortSpec = { 'price.value': 1 };
    else if (sort === 'priceDesc') sortSpec = { 'price.value': -1 };
    // "popular" placeholder: recent first until votes/clicks are wired into an aggregate
    else if (sort === 'popular') sortSpec = { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * pageSize;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortSpec).limit(pageSize).skip(skip).lean().exec(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    res.json({ items, page: pageNum, total, totalPages });
  }
);

/**
 * GET /api/products/:id
 */
router.get(
  '/:id',
  validate({ params: Joi.object({ id: Joi.string().length(24).hex().required() }) }),
  async (req, res) => {
    const doc = await Product.findById(req.params.id).lean().exec();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  }
);

module.exports = router;
