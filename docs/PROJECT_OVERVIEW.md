Awesome — here’s a **comprehensive `PROJECT_OVERVIEW.md`** tailored for an *already-in-progress* build, written for Cursor’s Agent Mode with you (novice dev) in mind, and tightly aligned to your brand/aesthetic and revenue goals.

> Save as: `/docs/PROJECT_OVERVIEW.md`

---

````markdown
# PROJECT_OVERVIEW.md — Discovery Studios

> **Audience & Operating Mode**
> - **Primary user:** Novice developer. The Agent must implement autonomously, improve structure, fix bugs, and pause at approval gates only.
> - **Agent directive:** **Augment-not-rewrite**. Analyze the existing code, preserve working UI/UX patterns, fix inconsistencies, and extend safely.
> - **MVP goal:** Ship a beautiful, cohesive, revenue-ready product quickly.

---

## 1) Platform Summary

**Discovery Studios** is a Web3-enabled fashion discovery platform that showcases brands, designers, and products with a high-end “Swedish grid / Balenciaga-inspired” aesthetic. It blends:
- **Web2 discovery** (search, curation, aggregation, affiliate checkout)
- **Web3 features** (wallet connect, on-chain voting, NFT proof-of-purchase)
- **Automated intake** (paid/free submissions), plus **lightweight scraping** of select aggregator sites

**Core outcomes**
- Users easily discover and evaluate high-fashion items/brands
- Voting and rankings (partly on-chain) build legitimacy and engagement
- Affiliate/paid-submission revenue, with a path to scalable data ingestion

**Primary KPIs (MVP)**
- Time-to-first-revenue (affiliate clicks & paid submission conversions)
- % of UI routes functioning and bug-free
- Wallet connects and on-chain votes recorded
- Scraped/ingested product count from 1–2 aggregators
- Page performance (LCP < 3s on mobile), zero critical accessibility blockers

---

## 2) Notable Decisions To Date (Source of Truth)

- **Augment-not-rewrite:** The Agent must **retain** current patterns/components and **improve** cohesion; do not bulldoze the existing structure.
- **Design System:** Minimal, avant-garde, asymmetric *Swedish grid* with black/white neutrals and neon accent `#4FFFF4`. Typography: **Inter**.
- **Routing:** Next.js app router + existing nested structures. All pages must resolve, be linked, and be future-proofed for dynamic data.
- **Monetization (MVP):**
  - **Affiliate checkout** (primary): If we have an affiliate URL → redirect with tracking; else fallback to brand or aggregator URL.
  - **Paid submissions** (secondary): “Priority review + instant scrape + featured placement.”
- **Web3 (Phase 1):**
  - Wallet connect (MetaMask + WalletConnect)
  - On-chain voting (Neon EVM): Web3 votes weighted higher than Web2 votes
  - **NFT Receipt** (on purchase redirect confirmation) — proof-of-purchase mint is allowed as a queued action (can mint later if webhook confirms)
- **Scraping (MVP):** Start with **1–2 aggregators** for reliability; prefer affiliate feeds/APIs where available; only use Playwright/Cheerio when allowed and stable.
- **Owner skill level:** Novice; Agent must self-optimize and write docs/changelogs as it works.

---

## 3) Tech Stack

- **Frontend:** Next.js 13+ App Router, React 18, Tailwind CSS  
  - Breakpoints: `mobile: 428px`, `tablet: 649px`, `desktop: 1149px`
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas recommended)
- **Web3:** Neon EVM (testnet for dev), ethers.js / viem, WalletConnect + MetaMask
- **Scraping:** Playwright (dynamic), Cheerio (static) — but prefer affiliate APIs/feeds where possible
- **Auth:** JWT (server), HTTP-only cookies; optional SIWE later
- **Infra/Deploy:** Vercel (frontend), Render/Heroku/Fly.io (backend), MongoDB Atlas, IPFS (optional for NFT assets)

---

## 4) Current Implementation Snapshot (From RepoPrompt + Review)

**Frontend present (partial):**
- **Layout & Navigation:** `Navbar`, `MegaMenu`, `MobileMenu`, `ScrollableNav`, `Footer`
- **Templates:** `CategoryGrid`, `CollectionGrid`, `ContentPage`, `GridLayout`, `ListLayout`
- **Pages implemented:** Home, Discover, Featured, Popular, Brand (detail), Designer (detail), Product (detail), About, Contact, FAQ, Privacy, Login, Signup, Liked, Saved, Submissions (+ nested category routes)
- **Gaps/Risks:** Some placeholder logic, incomplete routing edges, inconsistent data prop shapes, not all pages wired to dynamic data, accessibility/perf polish needed

**Backend present (minimal skeleton):**
- `server.js` + empty controllers/models/routes
- **No** API endpoints or DB integration implemented yet

**Web3 present:** None (planned only)

**Conclusion:** Excellent frontend head start; backend + Web3 = greenfield; scraping = planned.

---

## 5) Brand & UX Guardrails (Agent Must Enforce)

- **Aesthetic:** Minimal, high-contrast, editorial. Use neon `#4FFFF4` strategically (highlights, accents), not as a base color.
- **Layout:** Swedish grid / asymmetric blocks; large whitespace; clean borders; crisp type with increased tracking on labels.
- **Motion:** Subtle; prioritize calm parallax and micro-interactions (already used in Hero/Popular).
- **Accessibility:** Color contrast ≥ WCAG AA, focus states, semantic roles for menus, keyboard nav for MegaMenu.
- **Performance budgets:** LCP < 3s mobile, CLS < 0.1, JS < 300KB (post-cache) on key routes (Home/Discover/Brand/Product).
- **Consistency checks:** The Agent must lint the UI for:
  - Inconsistent spacings, font sizes, tracking, and divider usage
  - Broken links/misaligned segments in MegaMenu layers
  - Non-deterministic props (e.g., optional fields not guarded)
  - Mobile/Tablet/Desktop parity

---

## 6) Information Architecture

### 6.1 Content Types (MVP)

- **Brand**
  - name, type (Streetwear, High Fashion, etc.), location (city/country), year founded
  - hero images, logo (optional), story/description
  - links: site, instagram, store, affiliate id (if any)
- **Designer**
  - name, associated brand(s), location, bio, images
- **Product**
  - brandId, designerId (optional), title, category, price, images, sizes
  - affiliateLink / aggregatorLink / brandLink (one of these)
- **User**
  - email, passwordHash, roles (`user`, `admin`)
  - likes/saves, wallets[], preferences
- **Vote**
  - entityType (`brand|designer|product`), entityId
  - userId (nullable if anon?), weight (`1` web2, `2` web3 default), onChainTxHash (optional)
- **Submission**
  - type (`Brand`, `Designer`, `Both`)
  - URLs, category, email, status (`queued|review|approved|rejected`), priority (`free|paid`)
- **AffiliateProvider** (optional)
  - name, program, apiKey, urlFormat, cookieWindow
- **ScrapeJob**
  - source (`SSENSE`, `Farfetch`, etc.), status, targetUrl, lastRun, errorLog
- **RankingSnapshot**
  - date, computed ranks for brands/designers/products (for Leaderboard/archive)
- **AuditLog**
  - actor, action, payload, timestamp

### 6.2 Navigation & Routes (MVP)
- `/` → Hero, Featured, Popular
- `/discover` → curated grid (links to deep routes)
- `/:category/:section/:subsection` (already scaffolded)
- `/brand/[id]`, `/designer/[id]`, `/product/[id]`
- `/featured`, `/popular`
- `/login`, `/signup`, `/liked`, `/saved`, `/submissions`, `/about`, `/contact`, `/faq`, `/privacy`
- **Affiliate redirect:** `/r/[productId]` (server route resolves outbound link + tracking)

---

## 7) Monetization Plan (MVP)

### 7.1 Affiliate Checkout (Primary)
**Flow**
1. Product detail → user clicks **BUY**
2. Backend endpoint `/r/:productId` looks up:
   - `affiliateLink` (preferred)
   - else `aggregatorLink`
   - else `brandLink`
3. Track click (`ClickLog` implicit via AuditLog), redirect 302
4. (Optional) If we later receive a webhook (from affiliate network or storefront) → mint NFT receipt asynchronously

**Notes**
- Start with reliable networks/tools: **Rakuten**, **Awin**, **CJ**, **Impact** (prefer feed/API over scraping)
- Add affiliate providers gradually; store in **AffiliateProvider**

### 7.2 Paid Submissions (Secondary)
- **Free:** queued review, basic visibility
- **Paid:** priority review, instant scraping attempt (if allowed), featured slot
- Payment: **Stripe** Checkout (MVP) → webhook → mark Submission as `paid` and bump queue priority

---

## 8) Scraping / Data Ingestion Strategy (MVP)

**Guiding principle:** Prefer **official affiliate feeds/APIs** to reduce breakage/legal risk. Use scraping only where permitted and stable.

**Targets (start with 1–2):**
- **Lyst** (broad aggregator)
- **SSENSE** (high-fashion; anti-bot risk)
- **Farfetch**, **Mr Porter**, **END.**, **Matches**
- **Programmatic feeds:** Rakuten/Awin/CJ/Impact data feeds

**Technical approach**
- `ScrapeJob` runner (Node + Playwright)
- For permitted pages: fetch list → visit product detail pages → parse with Cheerio
- Normalize to internal Product schema
- Use `etag`/hashing to avoid duplicates, store `source` and `lastSeen`
- Rate-limit, rotate UA, respect robots.txt, backoff on 429s
- Cache raw HTML (short TTL) in object storage for debugging (optional in MVP)

**Ethics & Compliance**
- Prefer public APIs/feeds
- Respect robots and TOS; stop if blocked
- Provide take-down path

---

## 9) Web3 — Phase 1 (MVP)

**Chain:** Neon EVM (testnet for dev)  
**Wallets:** MetaMask, WalletConnect  
**Lib:** ethers.js or viem

### 9.1 Contracts (MVP)
1) **VotingRegistry**
- `castVote(entityType, entityId, weight)` — emits event; basic double-vote guard per wallet per entity
- `getVotes(entityType, entityId)` — returns on-chain count
- **Note:** On-chain vote = weight `2`. Web2 vote = weight `1` stored in Mongo; periodic batch may reconcile (Phase 2).

2) **ReceiptNFT** (optional for MVP; can be stubbed)
- `mintReceipt(buyer, productId, metadataURI)` — gated by backend signer
- Metadata can live on IPFS (Phase 2+); MVP can store minimal JSON on-chain or centralized URL

**Security:**  
- Use a **backend signer** (env private key) for privileged mints. Store signer key securely.  
- Keep contracts minimal, audited later.

### 9.2 Data Flow (MVP)
- **Wallet connect →** user session includes `walletAddress`
- **Vote click →** if wallet connected → on-chain `castVote` (tx hash stored in `Vote`); else → Web2 vote in Mongo
- **Checkout redirect →** webhook confirms purchase (if available) → backend queues `mintReceipt`

---

## 10) Backend Surfaces (High-Level)

**Base URL:** `/api` (Express)

- **Auth**
  - `POST /auth/register` → email, password
  - `POST /auth/login` → JWT, httpOnly cookie
  - `POST /auth/logout` → clear cookie

- **Users**
  - `GET /me` → profile, likes/saves
  - `PATCH /me` → update basics
  - `GET /users/:id/public` → public profile (votes, saved)

- **Catalog**
  - `GET /brands`, `GET /brands/:id`
  - `GET /designers`, `GET /designers/:id`
  - `GET /products`, `GET /products/:id`

- **Engagement**
  - `POST /likes` → like/unlike entity
  - `POST /saves` → save/unsave entity
  - `POST /votes` → if wallet present → trigger on-chain; else web2 vote

- **Rankings**
  - `GET /rankings/:kind` (`brands|designers|products`) → computed from votes (web3 weighted higher)
  - `GET /leaderboard` → enriched presentation data

- **Submissions**
  - `POST /submissions` → free or paid intent
  - `POST /payments/checkout` → Stripe session for paid
  - `POST /payments/webhook` → mark `paid`, enqueue scrape

- **Affiliate**
  - `GET /r/:productId` → redirect + track

- **Scraping**
  - `POST /scrape/jobs` (admin) → create/trigger
  - `GET  /scrape/jobs/:id` → status

**Middlewares:** JWT auth, role-based (`admin` for scraping controls), rate-limit, input validation (zod/joi).

---

## 11) Data Model (MongoDB) — Outline

```mermaid
erDiagram
  User ||--o{ Vote : casts
  User ||--o{ Like : toggles
  User ||--o{ Save : toggles
  User ||--o{ Submission : creates

  Brand ||--o{ Product : has
  Designer ||--o{ Product : may_design

  Vote {
    string _id
    string entityType  // brand|designer|product
    objectId entityId
    objectId userId
    number weight      // 1 (web2) or 2 (web3)
    string onChainTxHash
    date createdAt
  }

  Product {
    string _id
    objectId brandId
    objectId designerId
    string title
    string category
    number price
    string[] images
    string affiliateLink
    string aggregatorLink
    string brandLink
    string source         // lyst, ssense, etc.
  }

  Brand { ... }
  Designer { ... }
  User { ... }
  Like { userId, entityType, entityId, createdAt }
  Save { userId, entityType, entityId, createdAt }

  Submission {
    string _id
    string type          // Brand|Designer|Both
    string email
    string website
    string instagram
    string category
    string status        // queued|review|approved|rejected
    string priority      // free|paid
  }

  RankingSnapshot { date, brands[], designers[], products[] }
  ScrapeJob { source, targetUrl, status, lastRun, errorLog }
  AffiliateProvider { name, urlFormat, cookieWindow }
  AuditLog { actor, action, payload, createdAt }
````

**Indexes**

* `Product`: `{ brandId: 1 }`, `{ category: 1 }`, text index on `title`
* `Vote`: `{ entityType: 1, entityId: 1 }`
* `Submission`: `{ status: 1, priority: 1 }`
* `ScrapeJob`: `{ source: 1, status: 1 }`

---

## 12) Environments & Config

**Frontend (`/frontend/.env.local`)**

```
NEXT_PUBLIC_API_ENDPOINT=<backend_url>
NEXT_PUBLIC_SITE_NAME=Discovery Studios
NEXT_PUBLIC_SITE_URL=<vercel_url>
NEXT_PUBLIC_ANALYTICS_ID=<optional>
```

**Backend (`/backend/.env`)**

```
PORT=3001
MONGODB_URI=<mongodb_atlas_uri>
JWT_SECRET=<long_random>
OPENROUTER_API_KEY=<if using>
NEON_PRIVATE_KEY=<signer_private_key>
NEON_RPC_URL=<neon_rpc>
STRIPE_SECRET_KEY=<stripe>
STRIPE_WEBHOOK_SECRET=<stripe_wh>
AFFILIATE_DEFAULT_PROVIDER=<name>
```

**Web3**

* **Testnet first**, hardcode chain id + RPC in config module
* Store deployed addresses in `/backend/config/contracts.json`

---

## 13) MVP Scope & Non-Goals

**In-scope MVP**

* Fully routed UI, cohesive design, bug-free MegaMenu layers
* Functional Brand/Designer/Product pages (static to start; hooks ready for dynamic)
* Basic Auth (email/password), Likes, Saves
* Voting: Web2 (Mongo) + Web3 (Neon) path + tx storage
* Affiliate redirect flow with at least one provider working
* Submissions (free/paid) with Stripe session + webhook; queue job for scrape
* One scraper/ingest source working end-to-end

**Out-of-scope (MVP)**

* Complex personalization/ML
* SIWE (can be Phase 2)
* Full NFT marketplace
* Full multi-tenant brand dashboards

---

## 14) Risks & Mitigations

* **Scraping brittleness:** Prefer feeds/APIs; backoff and alerting; store error logs
* **Affiliate reliability:** Always fallback to brand link; decouple provider configs
* **On-chain UX friction:** Queue minting; don’t block checkout on a chain tx
* **UI drift vs spec:** Agent must run **UI lint pass** for spacing/labels/links each phase
* **Security:** JWT + httpOnly cookies; input validation; rate limiting; avoid leaking private keys

---

## 15) Future Roadmap (Post-MVP)

* SIWE login + unified identity graph
* Social graph for style influence, collections
* Dynamic curation dashboards for admins
* Multi-chain support; on-chain ranking snapshots
* Creator tooling for lookbooks and shoppable stories

---

## 16) Agent-To-Do (From This Document)

1. **Analyze existing UI** for inconsistencies (spacing/labels/routing), list diffs in `/docs/FRONTEND/OPTIMIZATIONS.md`, then fix.
2. **Finish missing pages** and ensure all menus & footer links resolve.
3. Implement `/api` with Auth, Catalog, Engagement, Rankings, Submissions, Affiliate redirect.
4. Wire frontend to API (start with fetch hooks; mock data fallback).
5. Integrate **WalletConnect + MetaMask**; implement `castVote` flow (Web3/Web2 fallback).
6. Add **Stripe** for paid submissions + webhook.
7. Implement **one affiliate provider** minimum; test redirect & tracking.
8. Add **one ingest source** (feed or scrape) and normalize to Product schema.
9. Write tests for critical flows; run Lighthouse/perf checks; fix violations.
10. Document changes in `/docs/CHANGELOG.md`; if a decision changes, add `/docs/DECISIONS/ADR-*.md`.

---

## 17) Approval Gates (High-Level)

* **Gate 1 — UI Complete:** All routes wired, no broken links, consistent styling, perf budget met on Home/Discover.
* **Gate 2 — Backend Core:** Auth + Catalog + Votes + Rankings + Affiliate redirect operational with Mongo.
* **Gate 3 — Web3 Phase 1:** Wallet connect + on-chain vote path integrated; tx hashes stored.
* **Gate 4 — Submissions & Payments:** Paid submission flow + webhook + priority queue.
* **Gate 5 — Scraper MVP:** One source → normalized products → visible in UI.
* **Gate 6 — Deploy:** Vercel + Backend host + monitoring; smoke test passes.

> At each gate, Agent must write a short summary in `/docs/SCOPE_AND_PHASES.md`, then **pause for human approval** (`APPROVE: Gate N`).

---

## 18) Glossary

* **Augment-not-rewrite:** Extend and repair instead of replacing large chunks
* **Affiliate redirect:** Server-side 302 to a monetized URL
* **RankingSnapshot:** Stored, reproducible daily/weekly rankings
* **ReceiptNFT:** On-chain receipt of purchase, minted by backend signer
* **Vote (Web2 vs Web3):** Web2 = DB only (weight 1), Web3 = on-chain (weight 2)

---


