
⸻

BACKEND / OVERVIEW

Audience & mode: The project owner is a novice developer. Cursor’s Agent Mode must work autonomously, optimize code, fix bugs, and pause only at approval gates defined in /docs/SCOPE_AND_PHASES.md.
Rule: Do not delete or replace existing backend files without an ADR and explicit approval. Prefer additive changes and small, reversible refactors.

0) Goals (MVP-first, revenue-aligned)
	•	Serve the existing Next.js UI with stable JSON APIs (products/brands/designers/saved/liked).
	•	Affiliate checkout MVP: redirect users to aggregator/brand links (append affiliate params when available).
	•	Scraper MVP: ingest products/brands from 1–2 fashion aggregators first; support expansion.
	•	Web3 Phase 1 (stubs ready): wallet connect endpoints + vote recording bridge (on-chain later).
	•	Security & Ops: JWT auth, RBAC, rate limits, logs, error contract, simple monitoring.
	•	Zero-surprises: agent continuously documents changes in /docs/CHANGELOG.md and ADRs in /docs/DECISIONS.

⸻

1) Current State — Agent Tasks

Agent MUST run these before coding:
	1.	Inventory backend/ and print a summary to the terminal & /docs/CHANGELOG.md:
	•	Files present:
	•	server.js (Express app bootstrap)
	•	controllers/brandController.js (empty)
	•	routes/scraping.js (empty)
	•	models/brandModel.js (empty)
	•	.env.example
	2.	Assess gaps: No DB connection logic, no auth middleware, no error handler, no models, no routing skeleton.
	3.	Decide minimal refactor plan (e.g., create modular structure below) and log it as ADR-0001-mvp-backend-modular-structure.md.

Proceed only after Gate 1A (Backend skeleton approved) from /docs/SCOPE_AND_PHASES.md.

⸻

2) Target Structure (augment-not-rewrite)

backend/
  server.js                        # keep as entrypoint; wire to src/app.js once created
  .env.example

  src/
    app.js                         # express app factory (mounts routes & middleware)
    config/
      db.js                        # mongoose connection
      logger.js                    # pino or winston
      env.js                       # validated env loader (zod or joi)
    middleware/
      auth.js                      # JWT verify, attach req.user
      rbac.js                      # role-based guards
      error.js                     # error serializer
      rateLimit.js                 # per-route rate limits
      validate.js                  # request schema validation
    models/
      User.js
      Brand.js
      Designer.js
      Product.js
      Submission.js
      Vote.js
      Order.js
      Session.js
    routes/
      index.js                     # /health, /v1 mount
      v1/
        auth.routes.js
        brands.routes.js
        products.routes.js
        designers.routes.js
        votes.routes.js
        submissions.routes.js
        checkout.routes.js
        web3.routes.js             # stubs for phase 1
        scraping.routes.js         # admin-protected triggers
    controllers/
      auth.controller.js
      brands.controller.js
      products.controller.js
      designers.controller.js
      votes.controller.js
      submissions.controller.js
      checkout.controller.js
      web3.controller.js
      scraping.controller.js
    services/
      auth.service.js
      brands.service.js
      products.service.js
      designers.service.js
      votes.service.js
      submissions.service.js
      checkout.service.js
      affiliates.service.js        # link builder
      scraping/
        index.js                   # orchestrator
        runners/
          aggregatorFarfetch.js    # example
          aggregatorSSENSE.js      # example
          brandGeneric.js          # example
        parsers/
          productParser.js         # normalize shape
          brandParser.js
        queue.js                   # in-process queue; optional BullMQ later
    utils/
      pagination.js
      errors.js
      constants.js
      crypto.js
    tests/
      integration/
      unit/

Note: Keep server.js but move logic into src/app.js so tests can import the app without starting a listener.

⸻

3) Environment & Config

.env.example (augment the existing):

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Mongo
MONGODB_URI=mongodb://localhost:27017/discovery_studios

# JWT
JWT_SECRET=replace_me
JWT_EXPIRES_IN=7d

# Rate limit
RATE_WINDOW_MS=60000
RATE_MAX=120

# Affiliate
AFFILIATE_DEFAULT_SOURCE=skimlinks
AFFILIATE_SKIMLINKS_ID=your_id
AFFILIATE_RAKUTEN_ID=your_id

# Scraping
SCRAPE_USER_AGENT=DiscoveryStudiosBot/1.0
SCRAPE_HEADLESS=true

# Web3 (Neon EVM)
NEON_RPC_URL=https://<neon-rpc>
NEON_CHAIN_ID=245022934
WALLETCONNECT_PROJECT_ID=your_wc_id
BLOCKCHAIN_KEY=your_neon_evm_private_key

src/config/env.js should validate with zod/joi and export a typed config object.

⸻

4) Data Model (MongoDB)

Core collections & relations
	•	User { email, passwordHash, roles: ['user'|'admin'|'curator'], wallets: [{address, chainId}], likes: [ObjectId], saves: [ObjectId], createdAt }
	•	Brand { name, slug, type, locations, description, links:{site, instagram}, images[], verified:boolean, createdAt, updatedAt }
	•	Designer { name, slug, brandId?, bio, links, images[], createdAt }
	•	Product { brandId, designerId?, title, slug, images[], price, currency, category, tags[], inStock?, source: 'aggregator'|'brand', sourceUrl, affiliate:{network, url, params}, scrapedAt, updatedAt, score? }
	•	Submission { submitterEmail, type:'brand'|'designer', payload, status:'queued'|'review'|'approved'|'rejected', createdAt }
	•	Vote { userId?, wallet?, targetType:'brand'|'designer'|'product', targetId, weight, onchainTxHash?, createdAt }
	•	Order { userId?, productId, outboundUrl, affiliateNetwork?, clickedAt, purchasedAt?, nftMintTxHash? }
	•	Session { userAgent, ip, userId?, createdAt, tokens? }

Indexing
	•	Brand.slug unique, Designer.slug unique
	•	Product.slug unique, Product.brandId index, Product.tags text index
	•	Vote.targetId compound with targetType
	•	Submission.status + createdAt index (review queue)

Agent: Add mongoose schemas with strict mode, timestamps, sensible defaults. Include .lean() usage in read-heavy controllers.

⸻

5) API Design (REST v1)

Base: /v1
Format: JSON { ok: boolean, data?: any, error?: {code, message, details?} }
Auth: JWT in Authorization: Bearer <token>; anonymous allowed for reads.

Auth
	•	POST /v1/auth/register → {email, password} → {ok, data:{user, token}}
	•	POST /v1/auth/login → {email, password} → {ok, data:{user, token}}
	•	GET /v1/auth/me (auth) → user profile

Brands / Designers / Products
	•	GET /v1/brands?query=&type=&page=&limit= → list
	•	GET /v1/brands/:slug → details (+ related products)
	•	GET /v1/designers?... same pattern
	•	GET /v1/products?brand=&category=&tag=&sort=score|-createdAt&page=&limit= → list
	•	GET /v1/products/:slug → details

Likes / Saves (MVP: Web2)
	•	POST /v1/products/:id/like (auth)
	•	POST /v1/products/:id/save (auth)
	•	GET /v1/users/me/likes / saves (auth)

Votes (Web3 bridge ready)
	•	POST /v1/votes (auth or wallet-session) → {targetType, targetId, weight?}
	•	MVP: persist as Web2 vote; later batch to chain.
	•	Returns vote record; if on-chain later, append onchainTxHash.

Submissions
	•	POST /v1/submissions → create review ticket (free/paid)
	•	GET /v1/submissions (admin/curator) → queue
	•	PATCH /v1/submissions/:id (curator) → approve/reject

Checkout (Affiliate Redirect)
	•	POST /v1/checkout/link → { productId } → { outboundUrl }
	•	Builds affiliate URL if available; falls back to sourceUrl.
	•	Logs an Order click event.

Scraping (admin-only)
	•	POST /v1/scrape/aggregators/run → { targets?: ['farfetch','ssense'] }
	•	POST /v1/scrape/brand → { url } → normalize + upsert Brand / Products
	•	GET /v1/scrape/status → latest run summary

Agent: Use middleware/validate.js with zod/joi schemas per route. Add rateLimit to auth & scraping endpoints.

⸻

6) Controllers/Services Patterns

Pattern: route → controller → service → model

Example: Brands

// controllers/brands.controller.js
const brandsService = require('../services/brands.service')
exports.list = async (req, res, next) => {
  try {
    const { query, type, page = 1, limit = 24 } = req.query
    const data = await brandsService.list({ query, type, page, limit })
    res.json({ ok: true, data })
  } catch (err) { next(err) }
}

// services/brands.service.js
const Brand = require('../models/Brand')
exports.list = async ({ query, type, page, limit }) => {
  const q = {}
  if (query) q.$text = { $search: query }
  if (type) q.type = type
  const docs = await Brand.find(q).lean().skip((page-1)*limit).limit(+limit)
  const total = await Brand.countDocuments(q)
  return { items: docs, total, page: +page, limit: +limit }
}


⸻

7) Error Handling & Logging
	•	Single error serializer middleware/error.js:
	•	Map validation errors → 400, auth → 401/403, not found → 404, default → 500.
	•	Response: { ok:false, error:{ code, message, details? } }.
	•	Logger config/logger.js (pino/winston) with request logging (method, url, status, ms).
	•	Correlation id (optional) per request for tracing.

⸻

8) Security
	•	JWT with rotation on login and short-lived access tokens (e.g., 15m) + refresh token route (phase 2).
	•	RBAC middleware rbac.js: requireRole('admin') for scraping triggers and submissions moderation.
	•	Helmet, CORS restricted to CORS_ORIGIN.
	•	Rate limit defaults: 60s / 120 req global; stricter on /auth, /scrape.
	•	Input validation everywhere (zod/joi).
	•	Secrets only from env; never commit.

⸻

9) Scraper MVP (Playwright + Cheerio)

Strategy
	•	Phase 1: 1–2 aggregators: SSENSE, FARFETCH (example), then expand.
	•	Runner uses Playwright (headless configurable) to render, capture HTML; Parsers (Cheerio) normalize to a Product shape.
	•	Queue: in-process serial queue initially; swap to BullMQ + Redis later for scale.

Normalized Product Shape (target)

{
  source: 'aggregator',
  sourceUrl: 'https://example.com/p/123',
  brand: 'Maison Margiela',
  title: 'TABI Boots',
  images: ['https://...'],
  price: 890,
  currency: 'USD',
  category: 'Footwear',
  tags: ['boots', 'leather'],
  affiliate: { network:'skimlinks', url:'...', params:{ sId: '...' } }
}

File Roles
	•	services/scraping/runners/aggregatorSSENSE.js → scrape listing + product detail, return normalized array.
	•	services/scraping/parsers/productParser.js → ensure required fields, coerce number/currency, sanitize.
	•	services/scraping/index.js → orchestrator (choose runner, write to DB with upsert by sourceUrl or slug).
	•	routes/v1/scraping.routes.js → admin-protected triggers.

Anti-ban Tips
	•	Respect robots.txt where applicable, reasonable delays, rotating UA (configurable), concurrency limits.

⸻

10) Affiliate Checkout

Flow
	1.	Frontend calls POST /v1/checkout/link with productId.
	2.	checkout.service loads product → passes sourceUrl to affiliates.service.
	3.	affiliates.service:
	•	If product.affiliate.url present → returns it.
	•	Else build Skimlinks/Rakuten deeplink: https://go.skimresources.com/?id=<AFFILIATE_SKIMLINKS_ID>&xs=<...>&url=<encoded sourceUrl>
	4.	Persist Order click event with outboundUrl.
	5.	Frontend 302 redirect to outboundUrl.

// services/affiliates.service.js
exports.buildLink = ({ product, network='skimlinks' }) => {
  if (product.affiliate?.url) return product.affiliate.url
  const url = product.sourceUrl
  if (!url) throw new Error('Missing sourceUrl')
  if (network === 'skimlinks') {
    const id = process.env.AFFILIATE_SKIMLINKS_ID
    return `https://go.skimresources.com/?id=${id}&xs=1&url=${encodeURIComponent(url)}`
  }
  // add more networks...
}


⸻

11) Web3 Phase 1 (stubs now, switch later)
	•	POST /v1/web3/session → begin a wallet session (nonce) for SIWE-style signature (Neon-compatible).
	•	POST /v1/web3/verify → verify signature, bind wallet to user.
	•	POST /v1/votes currently stores Web2 votes; later a worker can batch-submit to Neon and update onchainTxHash.

Contract specs & batching logic are in /docs/WEB3/* — keep endpoints compatible with that plan.

⸻

12) Testing
	•	Unit: services & utils.
	•	Integration: route tests using supertest; spin up in-memory Mongo (mongodb-memory-server) for CI.
	•	Smoke: post-deploy ping of /health and a couple of list endpoints.

⸻

13) Observability
	•	/health returns { ok:true, env, uptime, db:'ok'|'down' }.
	•	Structured logs.
	•	Add basic error alerting (CI step fails on test errors).
	•	Later: Sentry/Logtail hooks.

⸻

14) Incremental Implementation Plan (Agent)

Important: The agent must analyze existing files first, then perform small commits with clear messages. After each step, update /docs/CHANGELOG.md.

Step 0 — Skeleton & Wiring
	•	Create src/ structure and minimal app.js mounting /v1.
	•	Add config/env.js, config/db.js, connect mongoose in server.js.
	•	Add error middleware, rate limit, CORS, helmet, logger.
	•	Commit + update CHANGELOG.
Gate 1A approval required.

Step 1 — Models
	•	Implement User, Brand, Designer, Product, Submission, Vote, Order, Session with indexes.
	•	Seed script (optional) for a couple of brands/products for UI smoke test.
	•	Commit + CHANGELOG.
Gate 1B approval required.

Step 2 — Read APIs
	•	/v1/brands, /v1/products, /v1/designers list/detail with pagination.
	•	Standard response envelope; validation schemas.
	•	Commit + CHANGELOG.
Gate 1C approval required.

Step 3 — Auth + Likes/Saves
	•	/v1/auth/register|login|me, JWT middleware.
	•	Like/Save endpoints for products.
	•	Commit + CHANGELOG.
Gate 1D approval required.

Step 4 — Checkout (Affiliate)
	•	affiliates.service + checkout.routes/controller.
	•	Tests to ensure outbound URL is built correctly.
	•	Commit + CHANGELOG.
Gate 1E approval required.

Step 5 — Scraper MVP
	•	Add Playwright deps, runners for SSENSE (example) & Farfetch (or another you choose).
	•	Admin route to trigger scrape; persist normalized Product with sourceUrl.
	•	Commit + CHANGELOG.
Gate 1F approval required.

Step 6 — Web3 Stubs
	•	web3.routes for nonce/verify; bind wallet; votes accepts future on-chain upgrade.
	•	Commit + CHANGELOG.
Gate 1G approval required.

Step 7 — Hardening
	•	Rate limits per sensitive route, RBAC for scraping.
	•	Add CI tests and /health.
	•	Commit + CHANGELOG.
Gate 1H approval required.

⸻

15) Example Code Stubs (ready for Agent to expand)

server.js (augment existing)

require('dotenv').config()
const http = require('http')
const { connectDb } = require('./src/config/db')
const { createApp } = require('./src/app')

const PORT = process.env.PORT || 3001

async function main() {
  await connectDb()
  const app = createApp()
  http.createServer(app).listen(PORT, () => {
    console.log(`API listening on :${PORT}`)
  })
}

main().catch(err => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})

src/app.js

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('./middleware/rateLimit')
const error = require('./middleware/error')

function createApp() {
  const app = express()
  app.use(helmet())
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }))
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan('tiny'))
  app.use(rateLimit.global())

  app.get('/health', (req, res) => res.json({ ok:true, env:process.env.NODE_ENV || 'dev' }))
  app.use('/v1', require('./routes/index'))

  app.use(error.notFound)
  app.use(error.handler)
  return app
}

module.exports = { createApp }

src/routes/index.js

const router = require('express').Router()

router.use('/auth', require('./v1/auth.routes'))
router.use('/brands', require('./v1/brands.routes'))
router.use('/products', require('./v1/products.routes'))
router.use('/designers', require('./v1/designers.routes'))
router.use('/votes', require('./v1/votes.routes'))
router.use('/submissions', require('./v1/submissions.routes'))
router.use('/checkout', require('./v1/checkout.routes'))
router.use('/scrape', require('./v1/scraping.routes'))
router.use('/web3', require('./v1/web3.routes'))

module.exports = router


⸻

16) Acceptance Criteria (Backend Gate for UI integration)
	•	✅ All listed endpoints respond with stable JSON envelope, validation, and errors.
	•	✅ Products list endpoint supports pagination and sorts.
	•	✅ Checkout builds correct outbound URL when affiliate params exist or fallbacks apply.
	•	✅ Scraping admin route completes a run and persists normalized products.
	•	✅ Basic auth works; like/save updates user document.
	•	✅ Web3 session stubs return nonce & verify; votes stored (off-chain for now).
	•	✅ Postman collection (or docs/QA/TEST_PLAN_API.md) exists with sample calls.

⸻

17) Agent Working Agreements
	•	Always analyze repo diffs first; protect existing UI contracts (routes/props/labels) to avoid breaking pages.
	•	Prefer small PR-sized commits with clear messages.
	•	Keep /docs/CHANGELOG.md updated every commit; add ADRs for structural decisions.
	•	Ask for approval at each Gate; otherwise proceed autonomously.

⸻

18) Next Files to Create (by Agent)
	1.	src/app.js, src/config/*, src/middleware/*, basic src/routes/index.js.
	2.	All models/*.js with indexes.
	3.	routes + controllers + services for brands/products/designers (read only).
	4.	Auth + likes/saves.
	5.	Checkout + affiliates service.
	6.	Scraper MVP runners + admin routes.
	7.	Web3 stubs.

⸻
