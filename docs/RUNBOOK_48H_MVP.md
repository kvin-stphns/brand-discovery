# 48-Hour MVP Runbook

This runbook is beginner-friendly and assumes the current repo root is:

```bash
/Users/cozykev/Github (Local)/brand-discovery
```

## 1. Install Dependencies

From repo root:

```bash
npm install
```

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## 2. Configure Environment

Backend `.env` example:

```bash
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/brand_discovery
JWT_SECRET=replace-me
CORS_ORIGIN=http://localhost:3000
```

Frontend `.env.local` example:

```bash
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3001
```

## 3. Run Index Migration

Ask for approval before running index migrations against shared/staging/production Mongo.

Local-only command:

```bash
cd backend
npm run migrate:indexes
```

## 4. Import Demo Feed

Import controlled demo data through the feed importer:

```bash
cd backend
node scripts/import-feed.js --file data/demo-feed/products.json --source demo-json --type json
```

This should create/update products and write a FeedImportLog.

## 5. Run Backend

```bash
cd backend
npm run dev
```

Expected local URL:

```text
http://localhost:3001
```

Verify:

```bash
curl http://localhost:3001/healthz
curl http://localhost:3001/api/admin/status
curl http://localhost:3001/api/products?limit=3
```

## 6. Run Frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Expected local URL:

```text
http://localhost:3000
```

If port 3000 is busy, Next may choose another port. Use the URL printed by the dev server.

## 7. Run Backend Tests

```bash
cd backend
npm test
```

Required smoke coverage:

- `/api/admin/status`
- `/api/products`
- `/api/products/:id`
- `/api/affiliate/preview`
- `/api/affiliate/checkout`
- feed import script sanity

## 8. Run Frontend Checks

```bash
cd frontend
npm run build
```

If Playwright is installed/configured:

```bash
cd frontend
npx playwright test
```

Required smoke coverage:

- home renders
- popular/explore product card renders title/brand/image/price
- product detail renders
- cart opens and displays item
- affiliate checkout CTA exists
- rankings page renders without raw data strings

## 9. Verify Pages Manually

Open:

- `http://localhost:3000/`
- `http://localhost:3000/featured`
- `http://localhost:3000/popular`
- `http://localhost:3000/explore`
- `http://localhost:3000/discover`
- `http://localhost:3000/rankings`
- `http://localhost:3000/discover/map`

Then get a product ID:

```bash
curl http://localhost:3001/api/products?limit=1
```

Open:

```text
http://localhost:3000/product/PRODUCT_ID
```

Check:

- Product image loads.
- Brand/title/price are clean.
- Description/details are real.
- Cart works.
- Checkout CTA redirects through backend.

## 10. Deploy Test App

Backend deploy requirements:

- Set `MONGODB_URI`.
- Set `JWT_SECRET`.
- Set `CORS_ORIGIN` to frontend URL.
- Run approved index migration.
- Import demo feed or approved retailer feed.

Frontend deploy requirements:

- Set `NEXT_PUBLIC_API_ENDPOINT` to backend URL.
- Run build.
- Verify product and affiliate routes against deployed backend.

## 11. Reset Demo DB

Ask for approval before dropping Mongo collections.

Safer local reset option:

1. Use a fresh local database name, for example `brand_discovery_demo_reset`.
2. Run index migration.
3. Re-import demo feed.

Destructive option, approval required:

```bash
mongosh brand_discovery --eval 'db.products.deleteMany({ source: "demo-json" })'
```

## 12. Crawl / Firecrawl Safety

- Ask for approval before crawls over 200 products.
- Ask for approval before using Firecrawl credits.
- Do not use scraper output unless products pass validation and quality scoring.

