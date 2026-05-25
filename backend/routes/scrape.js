const express = require('express')
const router = express.Router()
const { runFarfetch } = require('../src/crawlee/farfetch')

// Trigger a quick scrape (limited items for speed)
router.post('/', async (req, res) => {
    try {
        // eslint-disable-next-line no-console
        console.log('[api] triggering on-demand scrape...')

        const maxItems = Number(req.body.limit || req.query.limit || 50)
        if (maxItems > 200 && String(process.env.ALLOW_LARGE_CRAWL || '').toLowerCase() !== 'true') {
            return res.status(400).json({ ok: false, error: 'Crawl limit over 200 requires explicit approval and ALLOW_LARGE_CRAWL=true.' })
        }
        const maxPages = Math.ceil(maxItems / 10) // Approx 10 items per page usually

        console.log(`[api] triggering scrape for ${maxItems} items...`)
        const result = await runFarfetch({ maxItems, maxPages: Number(maxPages) })

        res.json({ ok: true, result })
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[api] scrape failed:', err)
        res.status(500).json({ ok: false, error: err.message })
    }
})

module.exports = router
