const express = require('express')
const router = express.Router()

router.get('/', (req, res) => res.json({ ok: true }))

router.use('/brands', require('./brands'))
router.use('/designers', require('./designers'))
router.use('/products', require('./products'))
router.use('/votes', require('./votes'))
router.use('/submissions', require('./submissions'))
router.use('/rankings', require('./rankings'))
router.use('/affiliate', require('./affiliate'))
router.use('/admin', require('./admin'))

module.exports = router