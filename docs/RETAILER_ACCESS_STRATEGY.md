# Retailer Access Strategy

## Goal

Use the polished MVP to request approved affiliate product feeds, API access, or private catalog partnerships from high-end retailers and boutiques.

## Why Retailers Should Care

Discovery Studios should present itself as a brand-safe discovery surface that can:

- Send qualified purchase-intent traffic.
- Preserve product imagery and brand presentation quality.
- Use official affiliate/deeplink infrastructure.
- Respect usage rules, update frequency, and inventory availability.
- Provide analytics around outbound clicks and product engagement.
- Highlight boutique and designer products in a premium context.

## Application Paths

### Affiliate Networks

Apply through relevant networks when public programs exist:

- Rakuten Advertising
- CJ Affiliate
- Awin
- Impact
- Partnerize
- Sovrn Commerce
- Skimlinks
- FlexOffers

Application evidence should include:

- Deployed MVP URL.
- Screenshots of product cards/detail/cart/rankings.
- Data strategy explaining feed-first architecture.
- Privacy-safe analytics/click logging summary.
- Traffic plan and editorial positioning.
- Retailer-safe image/link usage policy.

### Direct Boutique Partnerships

For independent boutiques or stores without obvious network programs, request:

- CSV/XML/JSON product feed.
- Private API access.
- Affiliate/deeplink rules.
- Image usage permission.
- Inventory/availability update cadence.
- Contact for merchandiser/partnership approval.

### Private Feeds

Some retailers may support private feeds only after relationship approval. The app should make the technical ask clear and low-friction:

- Product ID/SKU.
- Brand.
- Title.
- Product URL.
- Affiliate/deeplink URL.
- Price/currency/original price.
- Image URLs and usage rights.
- Description/details/material/composition.
- Category/breadcrumbs.
- Sizes/variants.
- Availability/inventory.
- Shipping/returns summary.
- Update frequency.

## Recommended Sequence

1. Stabilize demo MVP and import controlled demo feed.
2. Capture QA screenshots and document product data flow.
3. Apply to major networks for larger retailers.
4. Contact direct boutiques with the partnership template.
5. Track applications in `docs/retailer-access/RETAILER_ACCESS_MATRIX.md`.
6. Once approved, write a source adapter for each feed/network and import into Mongo.

## What Not To Do

- Do not submit forms or send emails without explicit user approval.
- Do not claim approved partnerships that do not exist.
- Do not use scraping as the permanent data source in outreach.
- Do not ask for broad API access when a standard product feed is sufficient.

