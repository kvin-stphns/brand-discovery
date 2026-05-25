# Data Strategy

## Long-Term Source Of Truth

The permanent product data pipeline should be:

affiliate/product feed/API/manual CSV import -> feed adapter -> normalized product payload -> validation and quality scoring -> Mongo Product records -> frontend routes/components -> affiliate/cart checkout.

Preferred catalog sources:

- Affiliate network feeds: Rakuten, CJ, Awin, Impact, Partnerize, Sovrn, Skimlinks, FlexOffers.
- Direct retailer feeds: private CSV/JSON/XML/SFTP exports.
- Private APIs: approved retailer or boutique catalog endpoints.
- Manual CSV imports: controlled operational fallback for boutiques without formal APIs.

## Prototype Data

The MVP should use controlled demo feed data imported into Mongo through the same ingestion path that later handles real affiliate feeds. Demo data may be realistic and partner-facing, but it should not live as frontend arrays or page-level mocks.

## Scraping / Crawlee / Firecrawl Role

Scraping is allowed only for:

1. Prototype data collection.
2. Enrichment for missing fields.
3. Fallback for inaccessible pages.
4. Test/demo support.

Scraped products must pass validation before entering Mongo. Products with missing title, missing brand, missing image, invalid price, or garbage title should be rejected unless enrichment fixes the issue. Firecrawl should be credit-controlled and documented.

## Quality Gate

Every product entering Mongo should be normalized and scored:

- `hasTitle`
- `hasBrand`
- `hasImage`
- `hasPrice`
- `hasDescription`
- `score`

Frontend product APIs should exclude records below the display threshold by default.

## Feed Adapter Shape

All future adapters should return a common product payload:

```json
{
  "source": "demo-json",
  "sourceId": "source-specific-id",
  "retailer": "Retailer Name",
  "canonicalUrl": "https://retailer.example/product",
  "affiliateUrl": "https://affiliate.example/deeplink",
  "title": "Clean Product Title",
  "brand": "Designer Brand",
  "price": { "value": 790, "currency": "USD" },
  "images": ["https://cdn.example/image.jpg"],
  "description": "Product description",
  "details": ["Made in Italy"],
  "sizes": ["XS", "S", "M"],
  "availability": "in_stock",
  "category": ["Women", "Outerwear"],
  "breadcrumbs": ["Women", "Clothing", "Outerwear"]
}
```

## Why Scraping Is Not Permanent

Scraping is brittle for luxury retail because markup changes, anti-bot controls, lazy-loaded media, regional pricing, inventory, and variant availability can all break silently. It also weakens partnership conversations because retailers want controlled use of imagery, deeplinks, and inventory data.

Feeds and APIs give better freshness, permissions, legal clarity, and data consistency.
