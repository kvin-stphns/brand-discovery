const express = require('express');
const router = express.Router();
const { Product } = require('../models/productModel');

function cleanText(input) {
  if (!input) return ''
  let s = String(input)
  // strip CSS blocks and var() dumps
  s = s.replace(/\{[^}]*\}/g, ' ')
  s = s.replace(/var\([^)]*\)/g, ' ')
  // strip known class tokens leaked into text (Farfetch)
  s = s.replace(/\.ltr-[\w:-]+/gi, ' ')
  // strip common pseudo-classes that might linger
  s = s.replace(/:(hover|focus|active)/gi, ' ')
  // collapse whitespace
  s = s.replace(/\s+/g, ' ').trim()
  // guard against ridiculous leftovers
  if (/^\d{3}\s+Too\s+Many\s+Requests/i.test(s)) return ''
  return s
}

function sanitizeImages(doc) {
  const list = Array.isArray(doc.images) && doc.images.length ? doc.images : (Array.isArray(doc.media) ? doc.media : [])
  const imgs = (list || [])
    .map((u) => String(u || ''))
    .filter((u) => /^https?:\/\//i.test(u))
    // exclude tracking pixels and analytics
    .filter((u) => !/bat\.bing\.com|doubleclick|analytics|pixel\./i.test(u))
    // keep only image-like URLs
    .filter((u) => /\.(jpg|jpeg|png|webp)(?:\?.*)?$/i.test(u))
  return Array.from(new Set(imgs))
}

function toDTO(doc) {
  const title = cleanText(doc.title || doc.name)
  const brand = cleanText(doc.brand)
  const images = sanitizeImages(doc)
  return {
    _id: String(doc._id),
    title,
    brand,
    images,
    price: doc.price || undefined,
    canonicalUrl: doc.canonicalUrl || doc.url || undefined,
    source: doc.source,
  }
}

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

    // Fetch a bit extra to account for post-filter sanitation
    const raw = await Product.find(filter).sort(sortSpec).limit(pageSize * 3).skip(skip).lean().exec();
    // Map + filter invalid entries
    const mapped = raw
      .map(toDTO)
      .filter((p) => p.title && p.title.toLowerCase() !== '429 too many requests' && p.images && p.images[0])
    const items = mapped.slice(0, pageSize)
    const total = await Product.countDocuments(filter)
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
