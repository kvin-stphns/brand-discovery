# brand-discovery
A decentralized web-app for discovering new fashion brands across the web.

## Runbook (Backend + Frontend)

- Requirements: Node 18+ (or 20), MongoDB (local or Atlas)

- Env vars:
  - Backend: `MONGODB_URI` (required for live), `CORS_ORIGIN`, `FIRECRAWL_API_KEY` (optional), `FIRECRAWL_BUDGET` (default 500), `SSENSE_AFF_ID`, `FARFETCH_AFF_ID`
  - Frontend: `NEXT_PUBLIC_API_ENDPOINT` (e.g. http://localhost:3001)

- Start backend (DB only):
  - `cd backend`
  - `npm i`
  - `npm run start` (or `npm run start:mem` to run in-memory for local tests)

- Start frontend (always DB/live):
  - `cd frontend`
  - `npm i`
  - `npm run dev`

- Verify endpoints:
  - `GET /api/admin/status` => `{ ok: true, counts: { products, brands, designers }, sources: { farfetch, ssense, other } }`
  - `GET /api/products?limit=24` => `{ items: [ { images[0], title, brand, price.value } ] }`
  - `GET /api/affiliate/preview?productId=...` => returns affiliateUrl
  - `GET /api/affiliate/checkout?productId=...` => 302 to affiliateUrl and logs a Click

- Crawling (Crawlee + PlaywrightCrawler):
  - Moderate limits to avoid rate issues: `SCRAPE_MAX_PRODUCTS=200 SCRAPE_MAX_PAGES=50`
  - Farfetch: `npm run scrape:ff`
  - SSENSE: `npm run scrape:ss`
  - Both: `npm run scrape:all`
  - Optional: Firecrawl fallback via `FIRECRAWL_API_KEY` (used only if fields missing; budget defaults to free 500 credits)

- Index migration (idempotent; DO NOT RUN WITHOUT APPROVAL):
  - `npm run migrate:indexes`
  - Drops legacy unique on url/externalId, ensures unique compound `{ source, sourceId }`, and adds helper indexes

- Tests:
  - Backend smoke: `cd backend && npm test`
  - Frontend e2e (optional): add Playwright config and run basic card render check (see docs/FRONTEND/OPTIMIZATIONS.md)
