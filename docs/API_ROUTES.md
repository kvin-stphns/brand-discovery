# API Routes

Backend base in local development: `http://localhost:3001`

Frontend API base: `NEXT_PUBLIC_API_ENDPOINT`

## Health

### `GET /`

Returns plain text backend heartbeat.

Response:

```text
Backend OK
```

### `GET /healthz`

Response:

```json
{
  "ok": true,
  "uptime": 123,
  "version": "1.0.0"
}
```

Used by deployment and smoke checks.

## API Root

### `GET /api`

Response:

```json
{ "ok": true }
```

## Search

### `GET /api/search?q=term`

Searches brands, designers, and products.

Response:

```json
{
  "brands": [],
  "designers": [],
  "products": []
}
```

Potential users: global search in nav.

## Auth

### `POST /api/auth/login`

MVP email login.

Request:

```json
{ "email": "user@example.com" }
```

Response:

```json
{
  "token": "jwt",
  "user": { "id": "mongo-id", "email": "user@example.com", "role": "user" }
}
```

### `GET /api/auth/me`

Requires bearer token.

Response:

```json
{ "user": { "id": "mongo-id", "role": "user" } }
```

## Brands

### `GET /api/brands?q=&sort=-createdAt&limit=20&page=1`

Response:

```json
{ "items": [{ "_id": "id", "name": "Brand", "slug": "brand", "image": "https://..." }] }
```

Used by: brand grids/search.

### `GET /api/brands/:id`

Response:

```json
{ "_id": "id", "name": "Brand", "slug": "brand" }
```

Used by: `frontend/app/brand/[id]/page.tsx`.

### `POST /api/brands`

Admin only.

### `PATCH /api/brands/:id`

Admin only.

## Designers

### `GET /api/designers?q=&sort=-createdAt&limit=20&page=1`

Response:

```json
{ "items": [{ "_id": "id", "name": "Designer", "slug": "designer", "image": "https://..." }] }
```

### `GET /api/designers/:id`

Used by: `frontend/app/designer/[id]/page.tsx`.

### `POST /api/designers`

Admin only.

### `PATCH /api/designers/:id`

Admin only.

## Products

### `GET /api/products`

Query params:

- `brandId`: ObjectId.
- `designerId`: ObjectId.
- `q`: title/brand search.
- `source`: source namespace or comma-separated namespaces.
- `gender`: `Men`, `Women`, or `Unisex`.
- `category`: category or comma-separated category terms.
- `sort`: `new`, `priceAsc`, `priceDesc`, `popular`.
- `page`: number.
- `limit`: number.

Response:

```json
{
  "items": [
    {
      "_id": "id",
      "source": "demo-json",
      "sourceId": "demo-001",
      "retailer": "Demo Boutique",
      "canonicalUrl": "https://retailer.example/product",
      "affiliateUrl": "https://affiliate.example/deeplink",
      "title": "Wool Tailored Coat",
      "brand": "Studio Example",
      "price": { "value": 820, "currency": "USD" },
      "images": ["https://..."],
      "description": "Clean copy",
      "details": ["Made in Italy"],
      "sizes": ["XS", "S", "M"],
      "availability": "in_stock",
      "category": ["Women", "Outerwear"]
    }
  ],
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

Used by:

- `frontend/components/FeaturedBrands.tsx`
- `frontend/app/featured/page.tsx`
- `frontend/app/popular/page.tsx`
- `frontend/app/explore/page.tsx`
- `frontend/app/[category]/[section]/[subsection]/page.tsx`
- `frontend/app/[category]/[section]/view-all/page.tsx`

### `GET /api/products/:id`

Returns one normalized product.

Used by: `frontend/app/(shop)/product/[id]/page.tsx`.

## Votes

### `POST /api/votes`

Request:

```json
{
  "entityType": "product",
  "entityId": "mongo-id",
  "weight": 1,
  "source": "web2"
}
```

Response: created Vote document.

### `GET /api/votes/summary?entityType=product&entityId=:id`

Response:

```json
{
  "ok": true,
  "count": 3,
  "weightedScore": 5
}
```

## Rankings

### `GET /api/rankings?limit=20&gender=Women`

Returns DB-backed leaderboard rows.

Response:

```json
{
  "items": [
    {
      "rank": 1,
      "score": 112,
      "id": "product-id",
      "type": "product",
      "name": "Brand Product",
      "brand": "Brand",
      "image": "https://...",
      "price": { "value": 590, "currency": "USD" }
    }
  ]
}
```

Used by:

- `frontend/components/PopularBrands.tsx`
- `frontend/components/rankings/LeaderboardHub.tsx`

### `GET /api/rankings/mostLiked`

Aggregates votes.

### `GET /api/rankings/mostViewed`

Aggregates click logs.

### `GET /api/rankings/recentVotes`

Returns recent vote rows.

## Affiliate

### `GET /api/affiliate/preview?productId=:id`

Returns a clean preview and resolved affiliate URL.

Response:

```json
{
  "_id": "product-id",
  "title": "Product Title",
  "brand": "Brand",
  "price": { "value": 590, "currency": "USD" },
  "canonicalUrl": "https://retailer.example/product",
  "affiliateUrl": "https://affiliate.example/deeplink",
  "image": "https://...",
  "source": "demo-json",
  "sourceId": "demo-001"
}
```

### `GET /api/affiliate/preview?url=https://retailer.example/product`

URL-only preview fallback.

### `GET /api/affiliate/checkout?productId=:id&source=product&utm=mvp`

Redirects to resolved affiliate URL and logs a Click.

Used by product detail and cart.

### `GET /api/affiliate/checkout?url=https://retailer.example/product`

URL-only redirect fallback. Should be used sparingly because it lacks product context.

## Images

### `GET /api/img?u=https://remote-image.example/image.jpg`

Remote image proxy. Used only when necessary for remote image loading.

## Scrape

### `POST /api/scrape`

Prototype scrape trigger. This is not the production product data path. Limit should stay under 200 unless the user explicitly approves a larger crawl.

Request:

```json
{ "limit": 50 }
```

Response:

```json
{ "ok": true, "result": { "insertedOrUpdated": 50 } }
```

## Admin

### `GET /api/admin/status`

Returns counts and source health.

Response:

```json
{
  "ok": true,
  "counts": {
    "brands": 0,
    "designers": 0,
    "products": 0,
    "votes": 0,
    "clicks": 0
  },
  "sources": {
    "demo-json": 12
  }
}
```

Used by status dashboards and smoke tests.

### `GET /api/admin/data-status`

Legacy equivalent in `backend/routes/index.js`. Prefer `/api/admin/status`.

## Submissions

### `POST /api/submissions`

Request:

```json
{
  "type": "brand",
  "links": ["https://example.com"]
}
```

Response:

```json
{ "ok": true }
```

Currently MVP acknowledge-only; persistence is future work.

