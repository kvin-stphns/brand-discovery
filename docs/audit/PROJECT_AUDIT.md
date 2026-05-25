# Project Audit

Audit date: 2026-05-25

Scope: full repository review for a 48-hour deployable test MVP. The strategic direction is feed/API/manual catalog import first, with Crawlee/Playwright/Firecrawl retained only for prototype enrichment, fallback, and controlled demos.

## Executive Summary

The app has a strong visual identity and the basic frontend/backend route surface exists, but the current data layer is split between normalized product expectations and legacy scraper-shaped records. The biggest blockers are product quality, scraper defaults, frontend placeholder behavior, cart checkout, rankings scoring, and missing feed import infrastructure.

The safest MVP path is not a broad redesign. Keep the nav, mega menu, layout language, and typography intact. Add a feed importer and quality gate, seed demo data through Mongo, tighten backend product/ranking/affiliate behavior, and patch frontend product consumers so every product card/detail view reads the same normalized fields.

## 1. Broken UI / Pages / Components

- `frontend/app/(shop)/product/[id]/page.tsx:153-174` renders placeholder description, details, and shipping text instead of product fields.
- `frontend/app/(shop)/product/[id]/page.tsx:141-150` hardcodes sizes as `XS/S/M/L/XL` instead of using `product.sizes`.
- `frontend/app/(shop)/product/[id]/page.tsx:178-187` labels the purchase CTA as `PREVIEW CHECKOUT`, which is not a polished customer-facing checkout handoff.
- `frontend/components/ui/CartDrawer.tsx:33-35` renders the literal string `${it.price}` due escaped braces, so cart prices are visibly broken.
- `frontend/components/ui/CartDrawer.tsx:40-43` has a non-functional checkout button.
- `frontend/app/discover/page.tsx:11-17` passes an empty item list and relies on placeholder discovery tiles.
- `frontend/components/templates/CategoryGrid.tsx:119-147` treats the empty discover page as a special placeholder link grid with local placeholder imagery.
- `frontend/components/map/GeoMap.tsx:8-20` is explicitly a placeholder SVG and shows `Mock locations`.
- `frontend/components/PopularBrands.tsx:38-58` maps `/api/rankings` rows into `type: brand`, so product IDs can route to `/brand/:id` incorrectly.
- `frontend/components/rankings/LeaderboardTable.tsx:36` falls back to a brand placeholder image for all rows, which makes product rankings look unfinished.
- `frontend/components/rankings/LeaderboardHub.tsx:37` stores mode without a setter, so visible mode buttons do not switch modes.

## 2. Mock / Sample Data Sources

- `frontend/lib/rankings/mock.ts:36-88` generates synthetic leaderboard/list data from placeholder images.
- `frontend/lib/api/rankings.mock.ts:29-56` generates another synthetic ranking data set.
- `frontend/types/gridItems.ts:17-73` creates generic names like `Women Product 1`.
- `frontend/types/placeholders.ts:1-40` centralizes local placeholder images.
- `frontend/app/discover/page.tsx:11-17` is page-level mock behavior because the live page does not request DB data.
- `frontend/app/brand/[id]/page.tsx:6-34` and `frontend/app/designer/[id]/page.tsx:6-34` import static grid item helpers and local placeholder images.
- `backend/scripts/seed.js:74-119` can generate dummy brands/designers/products using placeholders. It is gated by `SEED_GENERATE_DUMMIES=true`, but it should not be the MVP demo data path.

## 3. Scraper / Crawler Problems

- `backend/routes/scrape.js:11-16` defaults an on-demand API scrape to 1000 products. New policy requires approval before crawls over 200 products.
- `backend/src/scraper/run.js:25-30` defaults scraper runs to 3000 products, also conflicting with the new approval policy.
- `backend/src/scraper/adapters/farfetch.js:19-26` upserts by `{ source, externalId }`, but the current Product schema is keyed by `{ source, sourceId }`.
- `backend/src/scraper/adapters/farfetch.js:112-127` emits legacy fields `externalId`, `url`, `name`, and `media` instead of normalized `sourceId`, `canonicalUrl`, `title`, and `images`.
- `backend/src/scraper/adapters/farfetch.js:301-304` calls `upsertProduct(record)` twice and increments success twice.
- `backend/src/scraper/adapters/ssense.js:22-28` has the same legacy `{ source, externalId }` upsert path.
- `backend/src/scraper/adapters/ssense.js:134-149` emits legacy fields, not normalized Product fields.
- `backend/src/scraper/adapters/ssense.js:333-336` also double-upserts and double-counts success.
- `backend/src/crawlee/common.js:85-92` upserts raw documents with no quality validation before entering Mongo.
- `backend/src/crawlee/farfetch.js:151-156` can replace garbage titles with generic `Brand Item` or `Product`, which prevents raw CSS dumps but still imports weak product data.
- `backend/src/crawlee/farfetch.js:163-179` and `backend/src/crawlee/ssense.js:137-150` use Firecrawl enrichment automatically when `FIRECRAWL_API_KEY` is set. The repo needs stricter credit/use documentation and a quality gate.

## 4. API Route Problems

- `backend/routes/products.js:71-72` treats `sort=popular` as newest-first placeholder behavior.
- `backend/routes/products.js:78-84` returns products without filtering low-quality records, missing-image products, or malformed titles.
- `backend/routes/products.js:91-98` only supports ObjectId lookup; there is no slug/sourceId lookup for future feed URLs.
- `backend/routes/affiliate.js:8-29` preview returns clean basics, but it does not include retailer/source grouping metadata.
- `backend/routes/affiliate.js:32-66` checkout supports a single product only. Multi-item cart logic must live in frontend for MVP, grouped by retailer/source.
- `backend/routes/rankings.js:33-38` produces placeholder scores and names by concatenating brand/title.
- `backend/routes/rankings.js:66-76` groups most-viewed by URL, not product, so rows cannot map cleanly to product cards.
- `backend/routes/admin.js:9-24` omits feed import status, product quality counts, and retailer/feed counts.
- `backend/routes/submissions.js:4-8` acknowledges submissions but does not persist them or validate the submitted link list beyond presence.

## 5. Mongo Model / Index Issues

- `backend/models/productModel.js:15` restricts `source` to `farfetch`, `ssense`, and `other`. Feed-ready sources need network/private/direct values without schema churn.
- `backend/models/productModel.js:18-20` has `canonicalUrl` but no `affiliateUrl`.
- `backend/models/productModel.js:25-28` has flat `brand` but no `retailer` or `retailerId`.
- `backend/models/productModel.js:45-46` has category and breadcrumbs arrays, but `backend/scripts/migrate-indexes.js:41-54` does not create a category index.
- `backend/models/productModel.js:58-63` defines the correct unique compound `{ source, sourceId }`, but legacy scraper adapters bypass it with `externalId`.
- There is no `Retailer` model.
- There is no `FeedSource` model.
- There is no `FeedImportLog` model.
- `backend/models/clickModel.js:5-20` captures click basics but does not store retailer/feed source or resolved URL strategy.

## 6. Product Data Mapping Issues

- Frontend product DTOs in `frontend/lib/api/client.ts:71-79` omit normalized fields needed by product detail/cart, including `affiliateUrl`, `retailer`, `source`, `sourceId`, `description`, `details`, `sizes`, `availability`, `shipping`, and `returns`.
- `frontend/app/featured/page.tsx:19` sends `sort: '-createdAt'`, but backend validation only allows `new`, `priceAsc`, `priceDesc`, and `popular`.
- `frontend/app/popular/page.tsx:18` and `frontend/app/explore/page.tsx:18` also send `sort: '-createdAt'`, causing validation failure or empty output depending middleware behavior.
- `frontend/app/featured/page.tsx:35`, `frontend/app/popular/page.tsx:25`, `frontend/app/explore/page.tsx:25`, `frontend/app/[category]/[section]/[subsection]/page.tsx:70`, and `frontend/app/[category]/[section]/view-all/page.tsx:64` fall back to local placeholder product images instead of relying on feed-quality DB records.
- `frontend/components/FeaturedBrands.tsx:32-40` maps title/image/brand but drops price and source/retailer context.
- `frontend/components/templates/CategoryGrid.tsx:163-176` displays item name/label only; product price and brand are missing on grid cards.

## 7. Cart / Affiliate Flow Issues

- `frontend/lib/store/cart.ts:4` stores `id`, `name`, `price`, `size`, `image`, and `qty`, but not brand, retailer, source, currency, or affiliate/canonical URL.
- `frontend/components/ui/CartDrawer.tsx:25-44` has empty and item display states, but no grouped multi-retailer checkout.
- `frontend/app/(shop)/product/[id]/page.tsx:190-205` and `frontend/app/(shop)/product/[id]/page.tsx:210-225` add product data to cart only from detail, with no brand/currency/source metadata.
- `frontend/app/(shop)/product/[id]/page.tsx:196-199` uses `alert()` for size validation rather than an accessible inline state.
- `backend/routes/affiliate.js:46-63` logs clicks for product checkout, which is good, but URL-based checkout does not create a click log.

## 8. Accessibility Issues

- `frontend/app/(shop)/product/[id]/page.tsx:78-80` uses generic `alt="Product Image"` rather than product brand/title.
- `frontend/app/(shop)/product/[id]/page.tsx:93-99` thumbnail buttons lack `aria-label`.
- `frontend/app/(shop)/product/[id]/page.tsx:128-133` icon buttons lack accessible labels.
- `frontend/app/(shop)/product/[id]/page.tsx:141-150` size select lacks an explicit label.
- `frontend/components/rankings/LeaderboardHub.tsx:17-30` select controls and mode buttons need labels/pressed state.
- `frontend/components/map/GeoMap.tsx:8` labels an SVG as a placeholder; the page should expose meaningful region/location text or not pretend to be live map data.

## 9. Test Coverage Gaps

- `backend/__tests__/smoke.test.js:20-51` covers admin status, product list, preview, and checkout in one broad smoke test, but does not assert product detail fields, quality filtering, click persistence, or feed imports.
- `backend/__tests__/rankings.test.js:7-22` only checks array shape, not DB-backed product ranking data.
- There are no tests for `Retailer`, `FeedSource`, or `FeedImportLog` because those models do not exist yet.
- There is no test for the manual feed importer script.
- `frontend/tests/smoke.spec.ts:3-11` only verifies the home page has a grid image.
- There are no frontend tests for popular/explore card content, product detail, cart, affiliate CTA, rankings, empty states, or raw scraped-string prevention.
- Frontend package does not include Playwright as a dependency even though a Playwright test file exists.

## 10. Must Fix For A Polished 48-Hour MVP

1. Add feed-ready models for `Retailer`, `FeedSource`, and `FeedImportLog`.
2. Expand `Product` with `retailer`, `retailerId`, `affiliateUrl`, `dataQuality`, and feed metadata while keeping `{ source, sourceId }` as the identity.
3. Add a normalized feed importer for JSON/CSV demo catalog input.
4. Import realistic demo data through the importer, not frontend arrays.
5. Add validation/normalization that rejects missing title, brand, image, or valid price.
6. Add quality scoring and hide products below threshold from frontend product APIs.
7. Cap scrape API/script defaults below 200 and route scraper output through the same validation path.
8. Remove automatic frontend scrape-on-empty behavior.
9. Fix product grid mappings to use normalized `images[0]`, `brand`, `title`, `price.value`, `price.currency`, and product `_id`.
10. Replace product detail placeholders with real fields and polished loading/empty/error states.
11. Fix cart price rendering, product metadata, and checkout grouping.
12. Keep affiliate checkout endpoint as the single smart redirect/logging path.
13. Make rankings product-aware and DB-backed using clicks, votes, recency, and quality score.
14. Update admin status with feed/quality/import visibility.
15. Add backend and frontend smoke coverage for the MVP routes and pages.
16. Complete project docs, retailer access strategy, retailer matrix, outreach templates, and runbook.
