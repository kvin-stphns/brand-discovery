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

// Search endpoint
router.get(
  '/search',
  validate({ query: Joi.object({ q: Joi.string().min(1).required() }) }),
  async (req, res) => {
    const q = req.query.q
    const re = new RegExp(q, 'i')
    const [brands, designers, products] = await Promise.all([
      Brand.find({ name: re }).limit(10),
      Designer.find({ name: re }).limit(10),
      Product.find({ $or: [{ name: re }, { tags: re }] }).limit(20),
    ])
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
  res.json({ brands, designers, products, votes, clicks })
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

module.exports = router