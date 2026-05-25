# QA Checklist

## Definition Of Done For Demo Launch

- App runs locally without crashes.
- Backend tests pass.
- Frontend build passes.
- Demo data is imported through feed tooling into Mongo.
- No page-level product mocks are visible.
- No raw JSON, CSS selector strings, CSS variable dumps, `undefined`, or `null` are visible.
- Product cards show image, brand, title, and formatted price.
- Product detail pages show real normalized fields.
- Cart displays item data and checkout CTAs.
- Affiliate checkout redirects and logs clicks.
- Rankings render DB-backed data.
- Admin status shows product/source/import quality.

## Backend QA

- `GET /healthz` returns `ok: true`.
- `GET /api/admin/status` returns counts without DB crash.
- `GET /api/products` returns only display-quality products by default.
- `GET /api/products?sort=popular` returns deterministic ranked products.
- `GET /api/products/:id` returns a normalized product.
- `GET /api/affiliate/preview?productId=:id` returns clean preview data.
- `GET /api/affiliate/checkout?productId=:id` redirects.
- Checkout creates a Click document.
- `GET /api/rankings` returns product-aware rows with id/type/name/image/score.
- `GET /api/rankings/mostViewed` groups by product when possible.
- Feed importer rejects products missing title, brand, image, or valid price.
- Feed import log records total/imported/rejected counts.

## Frontend QA

- Home renders hero, featured section, popular section, and rankings without runtime errors.
- Featured page shows DB-backed products.
- Popular page shows DB-backed products.
- Explore page shows DB-backed products.
- Discover page does not pretend placeholder products are live.
- Product detail page loads by product ID.
- Product detail image has meaningful alt text.
- Product detail description/details/shipping/returns are real or intentionally unavailable.
- Add to cart works with available product metadata.
- Cart drawer displays image, brand, title, size, quantity, formatted price.
- Cart checkout CTA points to `/api/affiliate/checkout?productId=...`.
- Rankings page renders without placeholder rows or raw object strings.
- Location/map page clearly distinguishes live data from future/empty state.

## Accessibility QA

- Keyboard can open/close cart and activate checkout links.
- Icon buttons have accessible labels.
- Select controls have visible or screen-reader labels.
- Dialog uses `role="dialog"` and `aria-modal`.
- Images have meaningful alt text.
- Empty/error/loading states are visible text.
- No text overlaps at mobile widths around 390px.

## Visual QA

- Nav/mega menu/global styling unchanged unless explicitly approved.
- Product card proportions remain aligned with the existing grid.
- No broken remote images.
- No obvious placeholder product imagery in product grids.
- Product detail spacing remains polished on mobile and desktop.
- Cart drawer text fits within its width.
- Rankings tables/lists are readable and not mock-like.

## Data QA

- Products have `source`, `sourceId`, `retailer`, `canonicalUrl`, `title`, `brand`, `price.value`, `price.currency`, and `images[0]`.
- `source + sourceId` uniquely identifies product.
- Slugs are not unique identity.
- Quality score is at or above display threshold for visible products.
- Demo feed can be deleted/reimported without frontend code changes.

## Manual Route Walkthrough

Visit:

- `/`
- `/featured`
- `/popular`
- `/explore`
- `/discover`
- `/rankings`
- `/women/rankings`
- `/men/rankings`
- `/discover/map`
- `/product/:id` using an ID from `/api/products`

For each route:

- Confirm no crash.
- Confirm no visible raw data.
- Confirm loading/empty/error behavior is intentional.
- Confirm mobile width does not overlap text.

