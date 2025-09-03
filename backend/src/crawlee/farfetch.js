/* eslint-disable no-console */
const { PlaywrightCrawler, RequestQueue, log } = require('crawlee')
const { chromium } = require('playwright')
const { upsertProduct, fromJsonLd, parsePrice, normalizeImageUrl, pickLargestFromSrcSet, firecrawlExtract, normalizeText } = require('./common')

function extractSourceIdFromUrl(url) {
  const m = String(url).match(/(?:item|product)[-\/](\d{6,})/i) || String(url).match(/[?&](?:cod|id)=(\d{6,})/i)
  return m ? m[1] : String(url)
}

function seedUrls() {
  const seeds = [
    'https://www.farfetch.com/shopping/men/items.aspx?view=180',
    'https://www.farfetch.com/shopping/women/items.aspx?view=180',
  ]
  const env = (process.env.SCRAPE_URLS_FF || process.env.SEED_LIST_URLS_FF || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return env.length ? env : seeds
}

async function runFarfetch({ maxItems = 1000, maxPages = 100 } = {}) {
  log.setLevel(log.LEVELS.INFO)
  const queue = await RequestQueue.open()
  for (const u of seedUrls()) await queue.addRequest({ url: u, label: 'LIST' })
  const productSeeds = (process.env.SCRAPE_PRODUCT_URLS_FF || process.env.SEED_PRODUCT_URLS_FF || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const u of productSeeds) await queue.addRequest({ url: u, label: 'DETAIL' })

  let seen = 0
  let firecrawl = { used: 0 }

  const crawler = new PlaywrightCrawler({
    requestQueue: queue,
    maxRequestsPerCrawl: maxItems * 3,
    maxConcurrency: 8,
    browserPoolOptions: { useFingerprints: true },
    useSessionPool: true,
    navigationTimeoutSecs: 45,
    requestHandlerTimeoutSecs: 120,
    async requestHandler({ request, page, enqueueLinks }) {
      const { label } = request
      if (label === 'LIST') {
        await page.goto(request.url, { waitUntil: 'domcontentloaded' })
        // Enqueue product detail links
        await enqueueLinks({
          strategy: 'all',
          globs: ['**/shopping/*/item-*.aspx', '**/shopping/*/product-*.aspx'],
          label: 'DETAIL',
        })
        // Enqueue pagination
        await enqueueLinks({ strategy: 'same-domain', globs: ['**page=**'], label: 'LIST' })
        return
      }

      // DETAIL
      await page.goto(request.url, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

      const sourceId = extractSourceIdFromUrl(request.url)
      const base = { source: 'farfetch', sourceId, canonicalUrl: request.url }

      // JSON-LD first
      const ldRaw = await page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.map((n) => n.textContent || '').join('\n')).catch(() => '')
      let extracted = fromJsonLd(ldRaw)

      // DOM fallback
      if (!extracted || !extracted.title || !extracted.images?.length) {
        const title = (await page.$eval('h1,[data-testid="product-title"]', (el) => el.textContent?.trim()).catch(() => '')) || ''
        const brand = (await page.$eval('a[aria-label*="Brand"], [data-testid="designer-name"], [itemprop="brand"]', (el) => el.textContent?.trim()).catch(() => '')) || ''
        const priceText = (await page.$eval('[data-testid*="price"], [itemprop="price"], .price', (el) => el.textContent?.trim()).catch(() => '')) || ''
        const imgs = await page.$$eval('img[src], img[srcset]', (els) => Array.from(new Set(els.map((e) => e.src || (e.srcset || '').split(' ')[0])))).catch(() => [])
        extracted = {
          title: normalizeText(title),
          brand: normalizeText(brand),
          price: parsePrice(priceText),
          images: imgs.map((u) => normalizeImageUrl(u))
        }
      }

      // Firecrawl rescue for missing criticals
      if ((!extracted.images?.length || !extracted.brand || !extracted.price?.value) && process.env.FIRECRAWL_API_KEY) {
        const schema = {
          title: 'string',
          brand: 'string',
          images: ['string'],
          price: { value: 'number', currency: 'string' },
          description: 'string',
          details: ['string'],
          sizes: ['string']
        }
        const out = await firecrawlExtract(request.url, schema, { budget: Number(process.env.FIRECRAWL_BUDGET || 500), used: firecrawl.used })
        firecrawl.used = out.used
        if (out.data) {
          extracted = { ...extracted, ...out.data }
        }
      }

      const doc = {
        ...base,
        title: extracted.title || '',
        brand: extracted.brand || '',
        price: extracted.price || { value: undefined, currency: 'USD' },
        images: (extracted.images || []).map((u) => normalizeImageUrl(u)),
        description: extracted.description || '',
        details: extracted.details || [],
        sizes: extracted.sizes || [],
      }

      await upsertProduct(doc)
      seen += 1
      if (seen >= maxItems) {
        await crawler.teardown()
      }
    },
  })

  await crawler.run()
  return { ok: true, insertedOrUpdated: seen, firecrawlUsed: firecrawl.used }
}

module.exports = { runFarfetch }
