const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => res.json({ items: [] }))
router.get('/:id', async (req, res) => res.status(404).json({ error: 'Not implemented' }))

module.exports = router