# Architecture

## Frontend

Path: `frontend/`

Stack:

- Next.js app router.
- React client components for data-heavy pages.
- Tailwind CSS and existing global visual identity.
- Zustand persisted cart store.
- API helpers in `frontend/lib/api/client.ts`.

Important route areas:

- `frontend/app/page.tsx`: home page.
- `frontend/app/featured/page.tsx`: featured feed.
- `frontend/app/popular/page.tsx`: popular feed.
- `frontend/app/explore/page.tsx`: mixed explore feed with ranking module.
- `frontend/app/discover/page.tsx`: discovery hub.
- `frontend/app/(shop)/product/[id]/page.tsx`: product detail.
- `frontend/app/rankings/page.tsx`: global rankings.
- `frontend/app/[category]/rankings/*`: category ranking variants.
- `frontend/app/discover/map/page.tsx`: location map view.

Important components:

- `frontend/components/templates/CategoryGrid.tsx`: main product/brand/designer grid presentation.
- `frontend/components/FeaturedBrands.tsx`: home featured section.
- `frontend/components/PopularBrands.tsx`: home popular section.
- `frontend/components/rankings/LeaderboardHub.tsx`: rankings dashboard module.
- `frontend/components/ui/CartDrawer.tsx`: cart drawer.
- `frontend/components/layout/*`: nav/mega menu/mobile menu. Do not casually alter.

## Backend

Path: `backend/`

Stack:

- Node/Express.
- MongoDB with Mongoose.
- Jest + Supertest.
- Crawlee/Playwright for prototype scraping only.

Entry points:

- `backend/server.js`: starts Express and database connection.
- `backend/src/app.js`: Express app factory and route mount.
- `backend/routes/index.js`: top-level API route composition.
- `backend/utils/db.js`: Mongo connection and in-memory Mongo support for tests.

## Mongo Models

Existing:

- `Product`: normalized product catalog record.
- `Brand`: brand profile.
- `Designer`: designer profile.
- `Click`: affiliate/click analytics.
- `Vote`: web2/web3 vote record.
- `User`: MVP auth user.

Feed-ready additions:

- `Retailer`: retailer/boutique source profile.
- `FeedSource`: feed/API/manual source configuration.
- `FeedImportLog`: import run status, counts, warnings, errors.

## API Route Map

- `GET /api`: API heartbeat.
- `GET /healthz`: backend health.
- `GET /api/search`: cross-entity search.
- `POST /api/auth/login`: email-only MVP auth.
- `GET /api/auth/me`: authenticated user.
- `GET /api/user/me`: user profile alias.
- `GET /api/user/me/saved`: saved items placeholder.
- `GET /api/user/me/liked`: liked items placeholder.
- `GET /api/brands`: list brands.
- `GET /api/brands/:id`: brand detail.
- `POST /api/brands`: admin brand create.
- `PATCH /api/brands/:id`: admin brand update.
- `GET /api/designers`: list designers.
- `GET /api/designers/:id`: designer detail.
- `POST /api/designers`: admin designer create.
- `PATCH /api/designers/:id`: admin designer update.
- `GET /api/products`: product list.
- `GET /api/products/:id`: product detail.
- `POST /api/votes`: create vote.
- `GET /api/votes/summary`: vote summary.
- `POST /api/submissions`: submission intake.
- `GET /api/rankings`: leaderboard.
- `GET /api/rankings/mostLiked`: most liked aggregation.
- `GET /api/rankings/mostViewed`: most viewed aggregation.
- `GET /api/rankings/recentVotes`: recent votes.
- `GET /api/affiliate/preview`: affiliate product preview.
- `GET /api/affiliate/checkout`: redirect and click logging.
- `GET /api/img`: remote image proxy.
- `POST /api/scrape`: prototype scrape trigger.
- `GET /api/admin/status`: admin status.
- `GET /api/admin/data-status`: legacy data status route.

## Data Ingestion Flow

Target flow:

1. Source file/feed is read by `backend/scripts/import-feed.js`.
2. Feed adapter maps source rows to a common product shape.
3. `normalizeProduct` cleans strings, URLs, arrays, price, retailer, categories, and availability.
4. Quality scoring marks critical fields.
5. Invalid products are rejected with warnings.
6. Retailer and FeedSource are upserted.
7. Product is upserted by `{ source, sourceId }`.
8. FeedImportLog stores run counts, rejects, warnings, and status.

## Affiliate Flow

1. Frontend CTA links to `/api/affiliate/checkout?productId=:id`.
2. Backend loads the product.
3. Resolver uses `product.affiliateUrl` first.
4. If no affiliate URL exists, resolver appends UTM params to `canonicalUrl`.
5. Click is logged.
6. User is redirected to the retailer/affiliate destination.

## Cart Flow

1. Product detail adds normalized product metadata to Zustand cart.
2. Cart drawer displays brand, title, image, price, size, quantity, and retailer/source.
3. One item checkout links directly to the affiliate checkout endpoint.
4. Multiple items are grouped by retailer/source, with individual checkout CTAs per item or group.

## Deployment Shape

Frontend and backend can be deployed separately. The frontend should set `NEXT_PUBLIC_API_ENDPOINT` to the backend base URL. Backend should set `MONGODB_URI`, `CORS_ORIGIN`, `JWT_SECRET`, and any affiliate/network credentials once available.

