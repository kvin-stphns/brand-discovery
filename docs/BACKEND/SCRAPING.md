
⸻

/docs/BACKEND/SCRAPING.md

Audience & Mode: Project owner is a novice; Cursor’s Agent Mode will implement and self-verify.
Contract: Do not rewrite existing UI or page routes. Add scrapers and ingestion behind the API and fill models incrementally. If structure changes are necessary, write an ADR first and wait for approval at the configured gate.

0) MVP Goals (revenue-first)
	1.	Support 1–2 aggregators end-to-end (start with SSENSE, then FARFETCH).
	2.	Create Products with Retailers and AffiliateLink when available.
	3.	Power the existing Featured / Popular / Category grids with real data.
	4.	Prepare the Checkout redirect: if AffiliateLink exists → use it; else fallback to retailers.productUrl.

This is enough to launch, test traffic, and start affiliate revenue. Add more sources later via adapters.

⸻

1) Architecture Overview

We’ll use a small queue + adapter pattern:

/backend
  /scraper
    adapters/
      ssense.adapter.ts
      farfetch.adapter.ts
      mrporter.adapter.ts      (stub for later)
    normalize/
      product.normalizer.ts
      brand.normalizer.ts
    utils/
      fetch.ts                 (Playwright/Cheerio helpers, proxy, headers)
      html.ts                  (cheerio helpers, selectors)
      robots.ts                (robots.txt cache/respect)
      rateLimit.ts             (backoff, concurrency gates)
  /workers
    scrape.worker.ts           (process ScrapeJob documents)
    schedule.cron.ts           (enqueue periodic jobs)
  /scripts
    enqueue-demo-jobs.ts       (seed initial scrape jobs)

	•	ScrapeJob (Mongo) describes “what to fetch” (listing URL, brand path, etc.).
	•	Worker takes the job → uses a source adapter → produces ScrapeResult (raw + normalized) → upsert Brand/Designer/Product and AffiliateLink.
	•	Normalizer creates a single canonical product/brand shape before DB write.
	•	Playwright for dynamic pages; Cheerio for static parsing.
	•	Respect robots.txt (cache once per domain), throttle via rateLimit.

⸻

2) Environment & Config

Add these (augment existing /backend/.env.example):

# Scraper runtime
SCRAPER_HEADLESS=true
SCRAPER_CONCURRENCY=2
SCRAPER_MAX_RETRY=3
SCRAPER_PROXY_URL= # optional (http://user:pass@host:port)

# Source toggles (canary rollout)
SCRAPER_ENABLE_SSENSE=true
SCRAPER_ENABLE_FARFETCH=true
SCRAPER_ENABLE_MRPORTER=false

# Affiliate (placeholder)
AFFILIATE_PROGRAM=impact
AFFILIATE_PARTNER_ID=your_partner_id
AFFILIATE_CAMPAIGN_ID=your_campaign
AFFILIATE_UTM_SOURCE=discovery
AFFILIATE_UTM_MEDIUM=affiliate
AFFILIATE_UTM_CAMPAIGN=fw25

Agent: create a small backend/config/scraper.ts that reads these envs and exports typed config.

⸻

3) Normalized Payloads (single source of truth)

Adapters output normalized payloads that the ingestion layer writes to Mongo. This keeps the UI and DB consistent even if a site changes.

3.1 Product (normalized)

// scraper/normalize/types.ts
export type NormalizedRetailer = {
  name: 'SSENSE' | 'FARFETCH' | 'MR PORTER' | string
  productUrl: string
  affiliateUrl?: string
  source: 'ssense' | 'farfetch' | 'mrporter' | 'unknown'
  availability: 'in_stock' | 'out_of_stock' | 'unknown'
  price: { currency: string; current: number; original?: number }
}

export type NormalizedProduct = {
  externalId?: string           // source SKU or hash
  name: string
  brand: { name: string }       // optionally slugify later
  designer?: { name: string }
  category?: 'Tops'|'Bottoms'|'Outerwear'|'Accessories'|'Footwear'|'Other'
  description?: string
  images: { url: string; label?: string }[]
  tags?: string[]
  retailers: NormalizedRetailer[]
  meta?: Record<string, any>
}

3.2 Brand (normalized)

export type NormalizedBrand = {
  name: string
  website?: string
  socials?: { instagram?: string; twitter?: string }
  images?: { url: string; label?: string }[]
  type?: 'Streetwear'|'High Fashion'|'Avant Garde'|'Hybrid'|'Techwear'|'Workwear'|'Other'
  meta?: Record<string, any>
}

Rule: Adapters never write to Mongo directly. They only return normalized objects.

⸻

4) Adapters (per source)

Each adapter implements:

export type Adapter = {
  canHandle(url: string): boolean
  fetchListing(input: { url: string; query?: string; page?: number }): Promise<NormalizedProduct[]>
  fetchProduct(input: { url: string }): Promise<NormalizedProduct | null>
  fetchBrand?(input: { url: string }): Promise<NormalizedBrand | null>
}

And is registered in an adapter registry:

// scraper/adapters/index.ts
import ssense from './ssense.adapter'
import farfetch from './farfetch.adapter'
export const adapters = [ssense, farfetch]; // enable via env flags

4.1 SSENSE (MVP #1)
	•	Domain: https://www.ssense.com
	•	Patterns:
	•	Listing example: /en-us/men/designers/<brand>
	•	Product example: /en-us/men/product/<brand>/<slug>/<id>

Strategy
	•	Use Playwright to load product pages (some content gated by JS).
	•	Prefer Cheerio for listing pages if server renders enough HTML.
	•	Parse price, availability, image gallery, canonical brand name.

Example (pseudo-code)

// scraper/adapters/ssense.adapter.ts
import { loadPage, parseHTML } from '../utils/fetch'
import { toNormalizedProduct } from '../normalize/product.normalizer'

const canHandle = (url: string) => /ssense\.com/.test(url)

async function fetchProduct({ url }) {
  const html = await loadPage(url, { playwright: true })   // returns HTML
  const $ = parseHTML(html)
  const name = $('h1').text().trim()
  const brand = { name: $('a[data-testid="brand-link"]').text().trim() || inferBrandFromBreadcrumb($) }
  const priceText = $('[data-testid="current-price"]').text()
  const price = parsePrice(priceText) // currency + number
  const images = $('[data-testid="image"] img').map((_i, el) => ({ url: $(el).attr('src') })).get()

  const retailers = [{
    name: 'SSENSE',
    productUrl: url.split('?')[0],
    source: 'ssense',
    availability: detectAvailability($),
    price
  }]

  return toNormalizedProduct({ name, brand, images, retailers })
}

export default { canHandle, fetchProduct, fetchListing /* implement incrementally */ }

4.2 FARFETCH (MVP #2)
	•	Domain: https://www.farfetch.com
	•	Pages can be more dynamic; expect client-side rendering.
	•	Use Playwright; wait for networkidle or a specific selector.

Notes
	•	Farfetch exposes JSON blobs in scripts sometimes; prefer parsing that when present for stability.
	•	Same normalized output. Reuse the normalizer.

4.3 MR PORTER (later)
	•	Stub an adapter with canHandle and TODO methods.
	•	Keep it disabled via env for now.

⸻

5) Ingestion (DB upsert)

A single ingestion function maps a NormalizedProduct + optional NormalizedBrand → Mongo writes:

// scraper/normalize/ingest.ts
import { Brand, Product, AffiliateLink } from '../../models'
import { slugify } from '../utils/strings'

export async function ingestNormalizedProduct(p: NormalizedProduct) {
  // 1) Ensure Brand exists
  const brandSlug = slugify(p.brand.name)
  const brand = await Brand.findOneAndUpdate(
    { slug: brandSlug },
    { $setOnInsert: { name: p.brand.name, slug: brandSlug, source: 'scraped' } },
    { upsert: true, new: true }
  )

  // 2) Upsert Product by (brand + name) slug
  const productSlug = slugify(`${brand.slug}-${p.name}`)
  const price = p.retailers[0]?.price
  const doc = await Product.findOneAndUpdate(
    { slug: productSlug },
    {
      $set: {
        brandId: brand._id,
        name: p.name,
        category: p.category || 'Other',
        description: p.description,
        images: p.images,
        price: price ? { currency: price.currency, current: price.current, original: price.original, lastSeenAt: new Date() } : undefined,
        meta: p.meta
      },
      $setOnInsert: { slug: productSlug }
    },
    { upsert: true, new: true }
  )

  // 3) Merge retailers onto the product (no dups by name+productUrl)
  const mergedRetailers = mergeRetailers(doc.retailers || [], p.retailers)
  if (mergedRetailers.changed) {
    doc.retailers = mergedRetailers.value
    await doc.save()
  }

  // 4) Create/Update AffiliateLink(s)
  await upsertAffiliateLinks(doc._id, p.retailers)

  return doc
}

Retailer merge rules
	•	Deduplicate by name + productUrl.
	•	Update availability, lastCheckedAt, and price if changed.

AffiliateLink upsert
	•	If we can construct affiliate URLs, create/refresh per (productId, retailer).

⸻

6) Queue & Worker

6.1 ScrapeJob

We already defined ScrapeJob model. Typical documents:

{ "source": "ssense", "kind": "listing", "payload": { "url": "https://www.ssense.com/en-us/men/designers/rick-owens" }, "status": "queued" }
{ "source": "ssense", "kind": "product", "payload": { "url": "https://www.ssense.com/en-us/men/product/..." }, "status": "queued" }

6.2 Worker loop

// workers/scrape.worker.ts
import { ScrapeJob, ScrapeResult } from '../models'
import { adapters } from '../scraper/adapters'
import { ingestNormalizedProduct } from '../scraper/normalize/ingest'
import { withRateLimit } from '../scraper/utils/rateLimit'

async function runOne(job) {
  const adapter = adapters.find(a => job.payload?.url && a.canHandle(job.payload.url))
  if (!adapter) throw new Error(`No adapter for url ${job.payload?.url}`)

  await ScrapeJob.updateOne({ _id: job._id }, { $set: { status: 'running' } })

  try {
    const results = job.kind === 'listing'
      ? await adapter.fetchListing(job.payload)
      : [await adapter.fetchProduct(job.payload)].filter(Boolean)

    const upserts = []
    for (const n of results) {
      const prod = await ingestNormalizedProduct(n!)
      upserts.push(prod._id)
    }

    await ScrapeResult.create({ jobId: job._id, source: job.source, normalized: { count: results.length }, upserts: { productIds: upserts } })
    await ScrapeJob.updateOne({ _id: job._id }, { $set: { status: 'success' } })
  } catch (err) {
    const attempts = (job.attempts || 0) + 1
    const failStatus = attempts >= Number(process.env.SCRAPER_MAX_RETRY || 3) ? 'failed' : 'queued'
    await ScrapeJob.updateOne({ _id: job._id }, { $set: { status: failStatus, lastError: String(err) }, $inc: { attempts: 1 } })
  }
}

export async function workerLoop() {
  const concurrency = Number(process.env.SCRAPER_CONCURRENCY || 2)
  while (true) {
    const jobs = await ScrapeJob.find({ status: 'queued' }).sort({ createdAt: 1 }).limit(concurrency)
    if (!jobs.length) { await sleep(1500); continue }
    await Promise.all(jobs.map(j => withRateLimit(() => runOne(j))))
  }
}

Agent tasks
	•	Add a CLI script: npm run worker:scrape to launch workerLoop().
	•	Create scripts/enqueue-demo-jobs.ts to seed 5–10 listings for SSENSE.

⸻

7) Anti-bot, ethics, and reliability
	•	Robots.txt: implement robots.ts helper (cache per domain for 24h). If disallowed, skip and mark job skipped.
	•	Politeness: withRateLimit() should implement:
	•	Intrasite sleeps (e.g., 1.5–3.5s jitter).
	•	Global concurrency cap via SCRAPER_CONCURRENCY.
	•	Backoff:
	•	403/429 → exponential backoff & limited retry.
	•	CAPTCHA → set job to failed with a specific lastError and do not auto-solve; surface in dashboard (later).
	•	User agent & headers: rotate a small list of realistic desktop UAs; include accept-language.
	•	Proxies: optional SCRAPER_PROXY_URL support in Playwright’s browser context.
	•	Content size limits: avoid storing full HTML; store only small raw subsets in ScrapeResult if critical for debugging.
	•	Legal: This is for discoverability and link-out with clear attribution; do not store copyrighted content beyond what’s necessary (name, price, primary image URL, link). Honor takedown requests.

⸻

8) Affiliate URL construction (MVP)

Goal: Where possible, transform retailer.productUrl → affiliateUrl.
	•	Implement a helper: utils/affiliate.ts:

export function toAffiliateUrl(retailer: string, productUrl: string) {
  const utm = new URL(productUrl)
  utm.searchParams.set('utm_source', process.env.AFFILIATE_UTM_SOURCE || 'discovery')
  utm.searchParams.set('utm_medium', process.env.AFFILIATE_UTM_MEDIUM || 'affiliate')
  utm.searchParams.set('utm_campaign', process.env.AFFILIATE_UTM_CAMPAIGN || 'launch')
  // For networks like Impact/Rakuten, prepend their tracking domain if configured.
  return utm.toString()
}

	•	In ingestNormalizedProduct, when creating/merging retailers:
	•	If affiliateUrl missing, set it = toAffiliateUrl(name, productUrl) and create an AffiliateLink record.

Later we can integrate true network-specific deep links (Impact/Rakuten). MVP uses UTM.

⸻

9) Category & label mapping

Your UI expects specific vocab. Create a small mapping to convert source taxonomies to our enums:

// normalize/category.map.ts
const map: Record<string, NormalizedProduct['category']> = {
  't-shirts': 'Tops',
  'shirts': 'Tops',
  'pants': 'Bottoms',
  'jeans': 'Bottoms',
  'jackets': 'Outerwear',
  'coats': 'Outerwear',
  'bags': 'Accessories',
  'jewelry': 'Accessories',
  'shoes': 'Footwear'
}
export const mapCategory = (s: string) => map[s.toLowerCase()] || 'Other'

Agent: apply this map inside each adapter until we build a shared taxonomy map.

⸻

10) API hooks (surface scraped data to UI)

Implement minimal read endpoints (augment /backend/routes):
	•	GET /api/products?limit=...&category=...&sort=popular
	•	GET /api/brands?featured=true
	•	GET /api/popular?kind=brand|designer|product&limit=... (reads RankingSnapshot)

And a safe admin endpoint for the worker demo:
	•	POST /api/scrape/enqueue (body: { source, kind, url }) – admin-only

Agent: add a simple JWT middleware and an ADMIN_ROLE env to guard the enqueue endpoint.

⸻

11) Dev & Runbook

11.1 NPM scripts

{
  "scripts": {
    "scrape:worker": "node -r esbuild-register backend/workers/scrape.worker.ts",
    "scrape:enqueue:ssense-demo": "node -r esbuild-register backend/scripts/enqueue-demo-jobs.ts"
  }
}

If the repo stays JS, use ts-node alternatives or convert these files to JS with JSDoc types. Agent decides and records ADR if switching to TS.

11.2 Local test flow
	1.	cp backend/.env.example backend/.env and fill Mongo + flags.
	2.	npm run scrape:enqueue:ssense-demo
	3.	npm run scrape:worker (watch logs)
	4.	Hit GET /api/products?limit=20 to confirm.
	5.	Open the UI grids (Featured/Popular) and confirm items render (seeded + scraped).

⸻

12) Acceptance Criteria (Gate – Scraper MVP)
	•	SSENSE product pages: adapter returns normalized products.
	•	SSENSE listing: fetches multiple products for a brand path.
	•	FARFETCH product pages: adapter returns normalized products.
	•	Ingestion writes Brand, Product, merges Retailers, and creates AffiliateLink.
	•	Rate limit / backoff prevents bans; robots respected.
	•	Admin enqueue endpoint exists (guarded).
	•	Featured/Popular pages can render live data without UI errors.
	•	ADR committed if the Agent changed languages/structure.

Pause for approval after the checkbox list passes. Wait for APPROVE: Gate Scraper MVP.

⸻

13) Agent Checklist (what to implement now)
	1.	Create folder structure under /backend/scraper, /backend/workers, /backend/scripts.
	2.	Implement utils: fetch.ts (Playwright init with headless & proxy), html.ts, rateLimit.ts, robots.ts, affiliate.ts, strings.ts (slugify).
	3.	Write SSENSE adapter:
	•	fetchProduct(url) (mandatory)
	•	fetchListing(url) (minimum: 12–24 products)
	4.	Write FARFETCH adapter (product only).
	5.	Create normalizers + ingestion function wired to Product/Brand/AffiliateLink models.
	6.	Write worker with retry/backoff and ScrapeResult logging.
	7.	Enqueue demo jobs and confirm DB writes.
	8.	Add simple GET APIs to read products/brands for the UI.
	9.	Update /docs/CHANGELOG.md and add ADR-xxxx-scraper-architecture.md summarizing choices (TS/JS, libraries, rate limits).
	10.	Request approval at the “Scraper MVP” gate.

⸻

14) Debugging & Observability (MVP)
	•	Structured logs: Include source, kind, url, jobId, attempt in every log line.
	•	Counters: Track counts per source per hour (simple in-memory + log).
	•	Failure triage:
	•	403/429 spikes → reduce concurrency, add proxy, increase jitter.
	•	Selector break → adapt adapter and add a selector unit test (jest optional).
	•	PII/data ethics: Print only truncated URLs in logs when they contain user tokens.

⸻

15) Future Work (post-MVP)
	•	More sources: Mr Porter, Matches, SSENSE Women, StockX style pages (if allowed).
	•	A Scraper Dashboard page under /admin (jobs queue, failures, retry button).
	•	Signature-based anti-duplication: compute a hash from brand+name+firstImage to avoid dupes across sources.
	•	Price/watchlists with change notifications.
	•	Real affiliate network deep links (Impact/Rakuten/Awin integrations).

⸻

16) Quick FAQ (owner)
	•	Will this break my UI? No — we’re filling models used by the UI. The UI keeps placeholders until real data exists.
	•	What if a site blocks us? The worker backs off; job stays queued/failed. You’ll still have seed data. We can add proxies later.
	•	Is this legal? We’re linking out and storing minimal product metadata. Respect robots.txt and comply with takedowns.

⸻

17) Code Stubs (Agent can expand)

scraper/utils/fetch.ts (sketch):

import { chromium } from 'playwright'
import * as cheerio from 'cheerio'

export async function loadPage(url: string, opts: { playwright?: boolean } = {}) {
  if (opts.playwright) {
    const browser = await chromium.launch({ headless: process.env.SCRAPER_HEADLESS !== 'false' })
    const context = await browser.newContext(process.env.SCRAPER_PROXY_URL ? { proxy: { server: process.env.SCRAPER_PROXY_URL } } : {})
    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => {})
    const html = await page.content()
    await context.close()
    await browser.close()
    return html
  }
  // Basic fetch for static pages if needed
  const res = await fetch(url, { headers: { 'user-agent': randomUA() } })
  return await res.text()
}

export function parseHTML(html: string) { return cheerio.load(html) }
function randomUA() { return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...' }

scraper/utils/rateLimit.ts (sketch):

let last = 0
export async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const diff = now - last
  const min = 1200 + Math.random()*1000
  if (diff < min) await new Promise(r => setTimeout(r, min - diff))
  last = Date.now()
  return fn()
}


⸻

Done-when
	•	A product page on SSENSE can be enqueued and shows up in GET /api/products.
	•	The homepage lists show at least a few scraped products/brands mixed in with placeholders.
	•	You can click through to a product page and the Add to Cart / Checkout button uses the retail link (with UTM).

⸻
