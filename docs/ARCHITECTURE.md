
⸻

ARCHITECTURE

Audience note (owner skill level): The project owner is a novice developer. Cursor’s Agent must work autonomously, optimize/fix code as needed, and pause only at approval gates defined in /docs/SCOPE_AND_PHASES.md. Keep explanations plain-English in summaries, but write code & docs like a senior engineer.

Agent directive (very important): You can see the entire project. Continuously analyze the repository and fill in all “(Agent-filled)” sections below. When you change file structure or decisions:
	•	Append a line to /docs/CHANGELOG.md.
	•	If you change a notable approach, create an ADR in /docs/DECISIONS/ADR-XXXX-title.md.
	•	Keep changes augment-not-rewrite unless an ADR explicitly approves a migration.

⸻

1) Purpose

This document defines the end-to-end architecture for the MVP of Discovery Studios (Web3 fashion discovery). It locks down how the existing frontend (Next.js + Tailwind) connects to the new backend (Express + MongoDB) and Web3 (Neon EVM smart contracts + wallet auth). It provides guardrails for extending the partially built project without breaking the current UI scaffold, and gives the agent explicit tasks to complete the missing layers.

⸻

2) Source of Truth
	•	Docs index: /docs/INDEX.md
	•	Scope/phases & approval gates: /docs/SCOPE_AND_PHASES.md
	•	Project overview (business goals & monetization): /docs/PROJECT_OVERVIEW.md
	•	Automation rules (must follow): /.cursorrules (root)

⸻

3) Repo Auto-Discovery (Agent Tasks)

Agent — do this immediately and update the sections below.

	1.	Scan the repo and produce a precise map (files, pages, components, models, routes).
	•	Include all Next.js app/ routes, pages/ legacy routes (if any), and shared components.
	•	Identify dead code / duplicates (example: lib/utils.ts and lib/utils.js both exporting cn).
	2.	Detect inconsistencies in UI structure, routing, naming, Tailwind breakpoints, and styling decisions.
	3.	Summarize backend state (controllers/routes/models present or empty), server bootstrap, and env config.
	4.	Summarize Web3 state (wallet UI placeholders, contract code present/absent).
	5.	Write your findings into the “4) Current State (Agent-filled)” section and commit:
	•	Update /docs/CHANGELOG.md with “Repo scan + architecture state doc populated”.
	•	If you propose structural changes, draft ADRs and wait for approval at the next gate.

⸻

4) Current State (Agent-filled)

4.1 Frontend Snapshot
	•	Framework: Next.js 13.4 (App Router)
	•	Structure:
		•	app/: Main application routes.
		•	components/: Modular components (Hero, FeaturedBrands, etc.).
		•	lib/: Utilities and API clients.
	•	Key Components: `Hero`, `FeaturedBrands`, `PopularBrands`, `LeaderboardHub`.
	•	Design System: Tailwind CSS + Shadcn UI (Radix Primitives).
	•	Known Issues: 
		•	`FeaturedBrands.tsx` uses `any` types and has a fragile 2s timeout.
		•	Web3 dependencies (`wagmi`, `viem`) installed but not fully integrated.

4.2 Backend Snapshot
	•	Server bootstrap: `backend/server.js` loads `src/app.js`.
	•	Routes: `products`, `brands`, `designers`, `votes` exist. `scraping.js` is empty.
	•	Models: `Product`, `Brand`, `Designer`, `Vote`, `User`, `Click` exist.
	•	Env: Uses `dotenv`. `helmet`, `cors`, `rate-limit` configured.
	•	Missing: `scraping` route implementation, Web3 routes, robust validation (Joi is installed but usage not verified in all controllers).

4.3 Web3 Snapshot
	•	Wallet UI: Dependencies installed (`wagmi`, `viem`).
	•	Contracts: `contracts/` directory exists but contains no Solidity files.
	•	Status: Planned but not implemented.

4.4 Data Dependencies
	•	Frontend fetches from `/api/products` via `lib/api/client.ts`.
	•	Backend connects to MongoDB.
	•	Scraping: CLI scripts (`scrape:ff`, `scrape:ss`) exist using Crawlee/Playwright, but API trigger is missing.

4.5 Proposed Minimal Changes (Augment-not-Rewrite)
	1.	Implement `backend/routes/scraping.js` to trigger scrapes safely.
	2.	Create `contracts/Voting.sol` and `contracts/ReceiptNFT.sol` scaffolds.
	3.	Add Web3 routes to `backend/routes/web3.js`.
	4.	Refactor Frontend API calls to use proper Types.

⸻

5) High-Level Architecture

+---------------------+        HTTPS         +---------------------+       RPC/HTTPS        +----------------------+
|  Next.js Frontend   | <------------------> |  Express API Layer  | <-------------------> |  Neon EVM (Contracts)|
|  (app/ + components)|                     |  (Node.js, REST)    |                      |  Voting/NFT/Verify   |
+----------^----------+                      +-----^---------^-----+                      +----------^-----------+
           |                                       |         |                                        |
           | Graph/REST                            |         | MongoDB                                |
           | (SWR/fetch/axios)                     |         | (Mongoose ODM)                         |
           v                                       v         v                                        |
    UI state, routes                          Auth, Products, Votes, Submissions, Rankings           |
    Wallet connect (WC/MetaMask)              JWT, RBAC, Rate limiting, Validation                    |
           |                                                                                          |
           +------------------------------------------+-----------------------------------------------+
                                                  Observability (logs/metrics), CI/CD, SecOps

	•	Frontend: Next.js 13 app router, Tailwind, component templates (grid/list/content).
	•	Backend: Express REST API, Mongoose models, JWT auth (user/curator/admin roles).
	•	Web3: Neon EVM contracts for Votes, Receipt NFTs, Brand Registry.
	•	Data sync: Web2 votes in Mongo; on approval/batch trigger -> mint on-chain (weighted).
	•	Scraping: Playwright + Cheerio services -> normalize -> store -> expose via API.

⸻

6) Directory Layout Guardrails (Augment-not-Rewrite)
	•	Frontend: keep existing /frontend/app/* and /frontend/components/*.
	•	Create only additive folders: /frontend/app/(account)/*, /frontend/app/(rankings)/*, etc.
	•	If consolidation is needed (e.g., pages/ → app/), propose it via ADR and wait for approval.
	•	Backend: expand /backend as:

backend/
  server.js
  /routes
    auth.js
    products.js
    brands.js
    designers.js
    votes.js
    submissions.js
    rankings.js
    web3.js
  /controllers
    authController.js
    productController.js
    brandController.js
    designerController.js
    voteController.js
    submissionController.js
    rankingController.js
    web3Controller.js
  /models
    User.js
    Brand.js
    Designer.js
    Product.js
    Vote.js
    Submission.js
    Session.js
  /lib
    db.js
    logger.js
    rateLimiter.js
    errorHandler.js
    auth.js (JWT, RBAC)
    validators/
  /scraper
    playwright/
    cheerio/
    normalizers/


	•	Contracts:

contracts/
  Voting.sol
  ReceiptNFT.sol
  BrandRegistry.sol
scripts/
  deploy.ts
  verify.ts
  simulate.ts



Agent: When you add these, document in /docs/CHANGELOG.md and create ADRs if you diverge.

⸻

7) Data Model (Planned Interfaces)

Agent: Keep these as source of truth for FE/BE contracts. If you need adjustments, propose ADRs.

// Shared DTO shapes (for FE typing and BE responses)
type Brand = {
  _id: string
  name: string
  category: 'High Fashion' | 'Streetwear' | 'Hybrid' | 'Techwear' | 'Workwear' | 'Avant Garde' | 'Other'
  location?: { city?: string; country?: string }
  website?: string
  instagram?: string
  createdAt: string
  updatedAt: string
}

type Designer = {
  _id: string
  name: string
  brandId?: string
  instagram?: string
  website?: string
  createdAt: string
  updatedAt: string
}

type Product = {
  _id: string
  brandId: string
  designerId?: string
  title: string
  category: 'Tops' | 'Bottoms' | 'Outerwear' | 'Accessories' | 'Footwear'
  images: string[]
  price?: number
  currency?: string
  affiliate?: { source: 'LTK' | 'ShopStyle' | 'Rakuten' | 'Custom'; url: string }
  sourceUrl?: string
  createdAt: string
  updatedAt: string
}

type Vote = {
  _id: string
  userId: string
  subjectType: 'brand' | 'designer' | 'product'
  subjectId: string
  weight: number // higher if on-chain verified
  txHash?: string
  createdAt: string
}

type Submission = {
  _id: string
  type: 'Brand' | 'Designer' | 'Brand & Designer'
  payload: any // structured per form
  status: 'queued' | 'in_review' | 'approved' | 'rejected'
  priority: 'free' | 'paid'
  createdAt: string
  updatedAt: string
}


⸻

8) API Surface (Planned)

Agent: Implement under /backend/routes/* with controllers and JOI/Zod validation.

	•	Auth: POST /auth/register, POST /auth/login, GET /auth/me
	•	Brands: GET /brands, GET /brands/:id, POST /brands (curator/admin), GET /brands/:id/products
	•	Designers: GET /designers, GET /designers/:id, POST /designers (curator/admin)
	•	Products: GET /products, GET /products/:id, POST /products (curator/admin)
	•	Votes: POST /votes (web2 store + optional on-chain tx), GET /rankings (computed)
	•	Submissions: POST /submissions, GET /submissions/:id, PATCH /submissions/:id (curator/admin)
	•	Web3: POST /web3/wallet/nonce, POST /web3/wallet/verify, POST /web3/vote, POST /web3/mint-receipt

⸻

9) Web3 Components (Planned)
	•	Voting.sol — records vote weight per subject; emits events for indexing.
	•	ReceiptNFT.sol — ERC-721 “proof of purchase” (metadata includes product + brand ids).
	•	BrandRegistry.sol — optional verification status for brands/designers.

Wallet Auth:
	•	SIWE-style nonce + signature verification route (/web3/wallet/nonce, /web3/wallet/verify).
	•	Store verified wallet against user, mark onChainVerified=true → higher vote weight.

⸻

10) Frontend Architectural Rules
	•	Routing: Keep your existing Swedish grid/“Balenciaga” scaffold. Do not rename existing routes without an ADR.
	•	UX polish: The agent must:
	•	Normalize spacing/offsets (headers, sticky sections).
	•	Fix inconsistent breakpoints (mobile/tablet/desktop) and class names.
	•	Replace placeholders with typed DTOs and mock adapters (lib/api/*.ts) to ease BE swap-in.
	•	UI Consistency Scanner (Agent task):
	•	Crawl all components for duplicated logic (e.g., grid item labeling, link builders).
	•	Move shared logic to /frontend/lib/ with unit tests.
	•	Produce a short report in /docs/FRONTEND/OPTIMIZATIONS.md.

⸻

11) Backend Architectural Rules
	•	Express + Mongoose only for MVP.
	•	Security first: Helmet, CORS whitelist, rate limiting, request validation, sanitized queries.
	•	Auth: JWT access tokens; refresh tokens optional for MVP. Roles: user, curator, admin.
	•	Scraper: Isolated service; never scrape on request path. Use a queue or background job (MVP can be manual trigger).

⸻

12) Data Flow (Written Diagram)

[User Browser]
   | 1: Navigate UI, connect wallet, browse products/brands
   v
[Next.js Frontend]
   | 2: fetch(...) REST → /products, /brands, /votes, /rankings
   v
[Express API]
   | 3: Controllers -> Services -> Mongoose Models
   v
[MongoDB]
   | 4: Store Web2 entities (brands/designers/products) and votes
   ^
   | 5: Scraper workers populate/refresh collections (playwright/cheerio)
   |
[Scraper Service] -- normalized → Products/Brands/Designers

[Wallet Connect]
   | 6: SIWE-like nonce -> signature -> verify
   v
[Express /web3/*] ---- RPC ----> [Neon EVM Contracts]
   | 7: Record vote tx / mint receipt
   v
[MongoDB] (store txHash and weight for hybrid rankings)


⸻

13) Performance, A11y, Error-handling, Observability
	•	FE perf: image sizes, next/image, avoid layout shifts; lazy load non-critical sections; memoize heavy components.
	•	A11y: keyboard nav in mega menus, ARIA attributes, focus states.
	•	Errors: global API error handler; FE toast/banner; capture in Sentry (or console fallback in MVP).
	•	Logs/Metrics: pino logs in BE; basic request timing; error counts; deploy GitHub Actions to run tests/lint.

⸻

14) Security & Secrets
	•	.env files per package; never commit secrets.
	•	Rate limit auth/vote endpoints.
	•	Validate all inputs (JOI/Zod).
	•	CORS: allow only your Vercel domain + local dev origins.

⸻

15) Environments & Config
	•	Frontend: NEXT_PUBLIC_* for public config only.
	•	Backend: PORT, MONGODB_URI, JWT_SECRET, RPC_URL, WALLET_CONNECT_PROJECT_ID, etc.
	•	Web3: PRIVATE_KEY loaded only in API or scripts; never in frontend.

⸻

16) Local Dev Architecture
	•	Run FE: cd frontend && npm run dev
	•	Run BE: cd backend && npm run dev (add nodemon)
	•	Mongo: local Docker or Atlas.
	•	Chain: Neon devnet or local Hardhat for contract testing.

⸻

17) Extension Rules (Do No Harm)
	•	Do not replace Tailwind with a different system.
	•	Do not delete existing pages; migrate via ADR if necessary.
	•	Do add missing pages/components in additive fashion.
	•	Do keep interfaces stable; add new fields as optional at first.

⸻

18) Migration Plan (If Needed)
	•	If consolidating pages/ → app/, create ADR-pages-to-app.md:
	•	List impacted routes; create adapters; ship in a short-lived branch; get approval at Gate 1.

⸻

19) Open Questions (Agent to resolve)
	•	Which aggregators first for scraping MVP (pick 1–2 with stable DOM + affiliate support)?
	•	Exact vote weighting (on-chain verified vs. off-chain).
	•	Which events and metadata for ReceiptNFT?
	•	Indexing strategy for rankings (Mongo aggregation vs. cached materialized views).

Agent: Propose answers in /docs/DECISIONS/ as ADR drafts and request approval.

⸻

20) Acceptance for this Doc
	•	Section 4) Current State fully populated by the agent from real code.
	•	Any proposed structural changes written as ADR drafts.
	•	/docs/CHANGELOG.md updated with this analysis.

⸻

Commit & Next Steps
	1.	Commit this file: docs/ARCHITECTURE.md.
	2.	Agent: Populate Section 4 now. Then proceed to:
	•	/docs/FRONTEND/OVERVIEW.md to lock routing + component rules and the UI polish tasks.
	•	/docs/BACKEND/OVERVIEW.md to scaffold API and models.
	•	Prepare the full /.cursorrules with approval gates.

⸻
