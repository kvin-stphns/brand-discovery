const express = require('express')
const router = express.Router()
const { runFarfetch } = require('../src/crawlee/farfetch')

// Trigger a quick scrape (limited items for speed)
router.post('/', async (req, res) => {
    try {
        // eslint-disable-next-line no-console
        console.log('[api] triggering on-demand scrape...')

        // Run for a small number of items to populate data quickly
        const result = await runFarfetch({ maxItems: 5, maxPages: 1 })

        res.json({ ok: true, result })
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[api] scrape failed:', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})

module.exports = router
