const express = require('express')
const router = express.Router()
const { User } = require('../models/userModel')
const { Brand } = require('../models/brandModel')
const { Designer } = require('../models/designerModel')
const { Product } = require('../models/productModel')
const { Vote } = require('../models/voteModel')
const { Click } = require('../models/clickModel')
const { signUserToken, authRequired } = require('../src/middleware/auth')
const { validate, Joi } = require('../src/middleware/validate')

router.get('/', (req, res) => res.json({ ok: true }))

function cleanText(input) {
  if (!input) return ''
  let s = String(input)
  s = s.replace(/\{[^}]*\}/g, ' ')
  s = s.replace(/var\([^)]*\)/g, ' ')
  s = s.replace(/\.ltr-[\w:-]+/gi, ' ')
  s = s.replace(/:(hover|focus|active)/gi, ' ')
  return s.replace(/\s+/g, ' ').trim()
}

function sanitizeImages(doc) {
  const list = Array.isArray(doc.images) && doc.images.length ? doc.images : (Array.isArray(doc.media) ? doc.media : [])
  const imgs = (list || [])
    .map((u) => String(u || ''))
    .filter((u) => /^https?:\/\//i.test(u))
    .filter((u) => !/bat\.bing\.com|doubleclick|analytics|pixel\./i.test(u))
    .filter((u) => /\.(jpg|jpeg|png|webp)(?:\?.*)?$/i.test(u))
  return Array.from(new Set(imgs))
}

// Search endpoint
router.get(
  '/search',
  validate({ query: Joi.object({ q: Joi.string().min(1).required() }) }),
  async (req, res) => {
    const q = req.query.q
    const re = new RegExp(q, 'i')
    const [brandsRaw, designersRaw, productsRaw] = await Promise.all([
      Brand.find({ name: re }).limit(10).lean().exec(),
      Designer.find({ name: re }).limit(10).lean().exec(),
      Product.find({ $or: [{ title: re }, { brand: re }] }).limit(40).lean().exec(),
    ])
    const brands = brandsRaw.map((b) => ({ _id: b._id, name: cleanText(b.name || '') }))
    const designers = designersRaw.map((d) => ({ _id: d._id, name: cleanText(d.name || '') }))
    const products = productsRaw
      .map((p) => ({ _id: p._id, title: cleanText(p.title || p.name || ''), brand: cleanText(p.brand || ''), images: sanitizeImages(p) }))
      .filter((p) => p.title && p.title.toLowerCase() !== '429 too many requests')
      .slice(0, 20)
    res.json({ brands, designers, products })
  }
)

// Auth endpoints (MVP: email-only magic)
router.post(
  '/auth/login',
  validate({ body: Joi.object({ email: Joi.string().email().required() }) }),
  async (req, res) => {
    const { email } = req.body
    let user = await User.findOne({ email })
    if (!user) user = await User.create({ email, role: 'user' })
    const token = signUserToken(user)
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } })
  }
)

router.get('/auth/me', authRequired, async (req, res) => {
  res.json({ user: { id: req.user.sub, role: req.user.role } })
})

// Admin data status (non-auth)
router.get('/admin/data-status', async (_req, res) => {
  const [brands, designers, products, votes, clicks] = await Promise.all([
    Brand.countDocuments(),
    Designer.countDocuments(),
    Product.countDocuments(),
    Vote.countDocuments(),
    Click.countDocuments(),
  ])
  const srcAgg = await Product.aggregate([
    { $group: { _id: '$source', n: { $sum: 1 } } },
  ])
  const sources = srcAgg.reduce((acc, cur) => {
    if (!cur._id) return acc
    acc[cur._id] = cur.n
    return acc
  }, {})
  res.json({ ok: true, counts: { brands, designers, products, votes, clicks }, sources })
})

// User endpoints
router.get('/user/me', authRequired, async (req, res) => {
  res.json({ user: { id: req.user.sub, role: req.user.role } })
})
router.get('/user/me/saved', authRequired, async (_req, res) => res.json({ items: [] }))
router.get('/user/me/liked', authRequired, async (_req, res) => res.json({ items: [] }))

router.use('/brands', require('./brands'))
router.use('/designers', require('./designers'))
router.use('/products', require('./products'))
router.use('/votes', require('./votes'))
router.use('/submissions', require('./submissions'))
router.use('/rankings', require('./rankings'))
router.use('/affiliate', require('./affiliate'))
router.use('/img', require('./images'))
router.use('/admin', require('./admin'))

module.exports = router
