const express = require('express')
const router = express.Router()
const { runFarfetch } = require('../src/crawlee/farfetch')

// Trigger a quick scrape (limited items for speed)
router.post('/', async (req, res) => {
    try {
        // eslint-disable-next-line no-console
        console.log('[api] triggering on-demand scrape...')

        // Run for a larger number of items by default, or use query param
        const maxItems = req.body.limit || req.query.limit || 1000
        const maxPages = Math.ceil(maxItems / 10) // Approx 10 items per page usually

        console.log(`[api] triggering scrape for ${maxItems} items...`)
        const result = await runFarfetch({ maxItems: Number(maxItems), maxPages: Number(maxPages) })

        res.json({ ok: true, result })
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[api] scrape failed:', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})

module.exports = router
