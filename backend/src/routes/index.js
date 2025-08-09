const router = require('express').Router()

router.get('/brands', (_req, res) => {
  res.json({ ok: true, data: [], meta: { page: 1, limit: 0, total: 0 } })
})

router.get('/products', (_req, res) => {
  res.json({ ok: true, data: [], meta: { page: 1, limit: 0, total: 0 } })
})

router.get('/designers', (_req, res) => {
  res.json({ ok: true, data: [], meta: { page: 1, limit: 0, total: 0 } })
})

module.exports = router
