# Project Brief

## What The App Is

Discovery Studios is a brand and product discovery platform for high-end fashion, luxury boutiques, concept stores, and emerging designers. It surfaces a curated product catalog through editorial-feeling discovery pages, rankings, location views, product detail pages, cart grouping, and affiliate checkout handoff.

The product should feel like a credible partner-facing MVP: polished enough to show retailers, boutiques, and affiliate managers while requesting product feed/API access or a private catalog partnership.

## Target User

- Style-forward shoppers who want to discover luxury, avant-garde, streetwear, designer, boutique, and hard-to-find products.
- Retailers and boutiques evaluating whether Discovery Studios is a credible affiliate/referral surface.
- Internal operators testing product feeds, product quality, routing, checkout handoff, and ranking behavior.

## Why It Exists

Luxury discovery is fragmented across retailer sites, affiliate networks, social feeds, and editorial recommendations. Discovery Studios exists to create a high-signal discovery layer where products can be browsed, ranked, saved, compared, and routed to the correct retailer checkout.

## Core Value Proposition

For shoppers, the app offers a sharp discovery surface with ranked products, curated collections, and clean product detail pages.

For retailers and boutiques, the app offers qualified referral traffic, brand-safe presentation, analytics-ready affiliate clicks, and a future-ready ingestion path for approved catalogs and private feeds.

## Long-Term Goal

The long-term architecture is:

affiliate/product feed/API/manual CSV import -> normalized Mongo product data -> app routes/components -> affiliate/cart checkout.

Approved data sources may include Rakuten, CJ, Awin, Impact, Partnerize, Sovrn, Skimlinks, FlexOffers, direct boutique CSV exports, or private retailer APIs. Scraping is not the permanent source of truth.

## 48-Hour MVP Goal

Build a deployable test MVP with:

- DB-backed demo data imported through feed tooling.
- Clean product cards and product detail pages.
- Functional cart and affiliate checkout handoff.
- DB-backed rankings/leaderboards.
- Admin/status visibility.
- No raw scraped strings, raw JSON, selector strings, `undefined`, broken images, or page-level mocks.
- Complete docs so future agents can continue safely.

