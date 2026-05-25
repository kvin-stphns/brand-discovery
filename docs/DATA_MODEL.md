# Data Model

## Product

Collection: `products`

Required MVP fields:

- `source`: feed/source namespace, for example `demo-json`, `awin`, `cj`, `rakuten`, `direct-csv`, `farfetch`, `ssense`.
- `sourceId`: stable product ID from that source.
- `retailer`: display name of retailer/boutique.
- `retailerId`: ObjectId reference to `Retailer` when available.
- `canonicalUrl`: canonical retailer product URL.
- `affiliateUrl`: affiliate/deeplink URL when approved.
- `title`: clean customer-facing product title.
- `brand`: designer/brand display name.
- `price.value`: numeric current price.
- `price.currency`: ISO currency code.
- `price.originalValue`: optional strikethrough/original price.
- `images`: ordered product image URLs.
- `description`: clean product description.
- `details`: array of product detail bullets.
- `sizes`: array of available sizes or size labels.
- `availability`: `in_stock`, `out_of_stock`, `preorder`, `limited`, or source-provided text.
- `sku`: retailer/network SKU when available.
- `color`: display color.
- `category`: normalized category tags.
- `breadcrumbs`: source category path.
- `shipping`: shipping summary.
- `returns`: returns summary.
- `dataQuality`: quality flags and score.
- `feedSourceId`: ObjectId reference to `FeedSource` when available.
- `createdAt`, `updatedAt`.

Indexes:

- Unique compound `{ source: 1, sourceId: 1 }`.
- Non-unique `{ slug: 1 }`, if slug is used for URL/display.
- `{ brand: 1 }`.
- `{ category: 1 }`.
- `{ createdAt: -1 }`.
- `{ "price.value": 1 }`.

Do not use slug as unique identity.

## Retailer

Collection: `retailers`

Fields:

- `name`: display name.
- `slug`: stable non-product slug.
- `website`: official website.
- `affiliateNetwork`: network name when known.
- `affiliateProgramUrl`: public affiliate application URL when available.
- `contactEmail`: partnership/contact email if known.
- `contactUrl`: contact/application form URL.
- `status`: `target`, `applied`, `approved`, `rejected`, `direct`, `inactive`.
- `priority`: `A`, `B`, or `C`.
- `notes`: operational notes.
- `createdAt`, `updatedAt`.

## FeedSource

Collection: `feedsources`

Fields:

- `name`: feed/source display name.
- `source`: source namespace used by Product.
- `retailerId`: optional Retailer reference.
- `type`: `demo-json`, `manual-json`, `manual-csv`, `affiliate-network`, `direct-api`, `direct-csv`, `scrape-enrichment`.
- `network`: `Rakuten`, `CJ`, `Awin`, `Impact`, `Partnerize`, `Sovrn`, `Skimlinks`, `FlexOffers`, `Direct`, `Demo`, or similar.
- `status`: `active`, `paused`, `prototype`, `needs-approval`.
- `config`: safe metadata only. Do not store secrets here.
- `lastImportedAt`: date of most recent import.
- `createdAt`, `updatedAt`.

## FeedImportLog

Collection: `feedimportlogs`

Fields:

- `feedSourceId`: optional FeedSource reference.
- `source`: source namespace.
- `filename`: imported file path/name.
- `status`: `started`, `completed`, `completed_with_warnings`, `failed`.
- `counts.total`: total rows read.
- `counts.imported`: products inserted/updated.
- `counts.rejected`: rows rejected by validation.
- `counts.created`: inserted products.
- `counts.updated`: updated products.
- `warnings`: warning strings.
- `errors`: error strings.
- `startedAt`, `finishedAt`.
- `createdAt`, `updatedAt`.

## Click

Collection: `clicks`

Fields:

- `productId`: Product reference.
- `url`: resolved outbound URL.
- `source`: UI source such as `featured`, `popular`, `grid`, `product`, `affiliate`, `checkout`.
- `sourceId`: product source ID.
- `productSource`: source namespace.
- `utm`: UTM/campaign string.
- `ipHash`: privacy-preserving IP hash.
- `userAgent`: request user agent.
- `createdAt`, `updatedAt`.

Useful future additions:

- `retailerId`
- `retailer`
- `resolutionStrategy`: `affiliateUrl` or `canonicalUtm`

## Vote / Ranking

Collection: `votes`

Fields:

- `userId`: optional User reference.
- `entityType`: `brand`, `designer`, or `product`.
- `entityId`: ObjectId of voted entity.
- `weight`: score weight.
- `source`: `web2` or `web3`.
- `txHash`: optional blockchain tx.
- `createdAt`, `updatedAt`.

Ranking should be computed from DB data using a mix of click counts, vote weights, recency, and product quality score. Test mode can use deterministic weights, but not frontend mock arrays.

## Frontend Mapping Contract

Every product card/detail/cart view should read:

- Image: `product.images[0]`
- Brand: `product.brand`
- Title/name: `product.title`
- Price: `product.price.value` and `product.price.currency`
- App route: `product._id`, with optional slug later
- Purchase CTA: `/api/affiliate/checkout?productId=product._id`

No visible UI should render raw objects, selector strings, CSS class strings, raw JSON, `undefined`, or `null`.

