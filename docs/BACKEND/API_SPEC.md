
⸻

Backend API Spec (v0) — Discovery Studios

Audience note (required): The project owner is a novice dev delegating implementation to Cursor Agent Mode. The agent must work autonomously, optimize code it writes, and fix its own bugs. The agent must not delete or break existing UI; it should augment and refactor safely behind feature flags/branches. Use the acceptance criteria & checkpoints below and wait for approval at each gate.

0) Goals (MVP scope for this API)
	•	Serve the existing Next.js UI with stable, versioned REST endpoints.
	•	Enable Auth (email + wallet), content discovery (brands/designers/products), likes/saves, submissions, rankings, and checkout/affiliate redirects.
	•	Provide Web3 proxies for wallet connect + on-chain voting + NFT receipt hooks (Neon EVM).
	•	Provide scraper admin endpoints to enqueue/inspect scraping tasks.
	•	Production-ready basics: input validation, pagination, consistent errors, JWT auth, CORS, rate limiting, and logging.

⸻

1) Conventions
	•	Base URL: /api/v0
	•	Auth: Bearer JWT in Authorization: Bearer <token>
	•	Content-Type: application/json
	•	Pagination: ?page=1&limit=24 (default limit 24, max 100)
	•	Search/Filter: ?q=term&category=Outerwear&brandType=High%20Fashion&sort=popularity:desc
	•	Date format: ISO 8601
	•	Errors (uniform):

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'email' is required",
    "details": [{ "path": "email", "rule": "required" }]
  }
}

	•	Common response envelope:

{ "data": { /* resource or array */ }, "meta": { "page": 1, "limit": 24, "total": 120 } }

	•	Environments: development, staging, production
	•	Versioning: Prefix all endpoints with /api/v0. Future: /api/v1.

⸻

2) Security & Middleware (must-implement)
	•	CORS: Allow NEXT_PUBLIC_SITE_URL (from env). Deny others by default.
	•	Rate limiting: 60 req/min per IP (public); 600 req/min for authenticated; configurable.
	•	Helmet: Basic security headers.
	•	JWT: HS256 (server secret) for email/password auth; SIWE / wallet signature support via nonce → signature → JWT flow.
	•	RBAC roles: user, curator, admin. Curators/admins can approve submissions and trigger scrapes.
	•	Audit log: Write notable actions (login, vote, submission approve, contract calls) to MongoDB collection audit_logs.

⸻

3) Validation (zod/Joi)

Use zod for clarity. Example:

const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  sort: z.string().optional(),   // "field:asc|desc"
  q: z.string().optional()
})

Agent: Generate a validation folder with schemas per route. Fail fast with 400.

⸻

4) Auth & Users

4.1 Register (email)

POST /api/v0/auth/register

{ "email": "a@b.com", "password": "StrongPass!234", "displayName": "Kev" }

201

{ "data": { "id": "u_123", "email": "a@b.com", "displayName": "Kev" } }

Errors: EMAIL_IN_USE, WEAK_PASSWORD.

4.2 Login (email)

POST /api/v0/auth/login

{ "email": "a@b.com", "password": "StrongPass!234" }

200

{ "data": { "token": "<jwt>", "user": { "id": "u_123", "email": "a@b.com", "displayName": "Kev" } } }

4.3 Wallet: nonce

POST /api/v0/auth/wallet/nonce

{ "address": "0xabc..." }

200

{ "data": { "nonce": "random-string" } }

4.4 Wallet: verify (SIWE-style)

POST /api/v0/auth/wallet/verify

{ "address": "0xabc...", "signature": "0x...", "nonce": "random-string" }

200

{ "data": { "token": "<jwt>", "user": { "id": "u_123", "address": "0xabc..." } } }

If address is new, create user with authProvider="wallet".

4.5 Me

GET /api/v0/users/me → JWT required
200

{ "data": { "id": "u_123", "email":"a@b.com", "address":"0x...", "roles":["user"], "stats": { "likes": 12, "saves": 7, "votes": 5 } } }

4.6 Update profile

PATCH /api/v0/users/me

{ "displayName": "Kev", "bio": "Fashion enjoyer", "avatarUrl": "https://..." }

200 → updated user

⸻

5) Catalog (Brands / Designers / Products)

Note: Use placeholder data now; wire to MongoDB once models exist. Keep response shapes stable.

5.1 Brands
	•	GET /api/v0/brands (pagination + filters)
	•	Filters: type (Streetwear|High Fashion|…), q, location, sort=popularity:desc|newest:desc
	•	200

{ "data":[ { "id":"b_1","name":"Brand 1","type":"High Fashion","heroImage":"/...","location":"Tokyo","stats":{"likes":10,"saves":4} } ], "meta":{ "page":1,"limit":24,"total":120 } }


	•	GET /api/v0/brands/:id
	•	GET /api/v0/brands/:id/products (pagination)

5.2 Designers
	•	GET /api/v0/designers (similar filters)
	•	GET /api/v0/designers/:id
	•	GET /api/v0/designers/:id/collections (optional for later)

5.3 Products
	•	GET /api/v0/products
	•	Filters: category (Tops|Outerwear|…), brandId, designerId, priceMin, priceMax
	•	GET /api/v0/products/:id

⸻

6) Social: Likes & Saves

6.1 Like/Unlike

POST /api/v0/interactions/like

{ "entityType": "brand|designer|product", "entityId": "b_1", "like": true }

200

{ "data": { "liked": true, "likesCount": 11 } }

6.2 Save/Unsave

POST /api/v0/interactions/save

{ "entityType": "brand|designer|product", "entityId": "b_1", "save": true }

200

{ "data": { "saved": true, "savesCount": 5 } }

6.3 My liked/saved
	•	GET /api/v0/users/me/liked?type=brand|designer|product
	•	GET /api/v0/users/me/saved?type=brand|designer|product

⸻

7) Submissions (Brand/Designer)

7.1 Create submission

POST /api/v0/submissions

{
  "type": "Brand|Designer|Brand & Designer",
  "brandName": "—",
  "designerName": "—",
  "website": "https://...",
  "instagram": "https://instagram.com/...",
  "category": "High Fashion",
  "email": "submitter@x.com",
  "notes": "Optional",
  "tier": "free|paid"
}

201

{ "data": { "id":"sub_123","status":"queued_review","tier":"paid" } }

7.2 Admin/Curator review
	•	GET /api/v0/submissions?status=queued_review|approved|rejected (curator+)
	•	PATCH /api/v0/submissions/:id (curator+)

{ "status":"approved", "reason": null }

	•	If approved and tier=paid, enqueue scrape job immediately.

⸻

8) Rankings & Voting

MVP rule: Web2 votes record in MongoDB; optional on-chain mirror (higher weight) via Neon EVM proxy.

8.1 Cast vote

POST /api/v0/votes

{
  "entityType":"brand|designer|product",
  "entityId":"b_1",
  "weight":"web2|web3"
}

	•	If weight=web3: requires wallet JWT; server calls Neon proxy below.
200

{ "data": { "entityId":"b_1","totals":{ "web2":120,"web3":45,"score":210.0 } } }

8.2 Rankings

GET /api/v0/rankings
	•	Params: type=brand|designer|product, period=all|30d|7d, sort=score:desc
200

{ "data":[ { "entityId":"b_1","name":"Brand 1","score":210.0,"rank":1 } ], "meta":{ "page":1,"limit":50,"total":500 } }


⸻

9) Checkout / Affiliate

9.1 Resolve outbound link

POST /api/v0/checkout/resolve

{ "productId":"p_123" }

200

{
  "data": {
    "productId":"p_123",
    "destination":"https://retailer.com/item/xyz?aff_id=abc123",
    "hasAffiliate": true,
    "fallback":"https://retailer.com/item/xyz"
  }
}

	•	Server enriches with known affiliate IDs when possible; else returns fallback.
	•	Client behavior: open in new tab, track click with POST /api/v0/checkout/track.

9.2 Track click

POST /api/v0/checkout/track

{ "productId":"p_123","destination":"https://...","hasAffiliate":true }

202 { "data": { "tracked": true } }

⸻

10) Web3 Proxies (Neon EVM)

Do not expose the private key to client. The server signs/relays where needed, or instructs client to sign via wallet.

10.1 Get contract config

GET /api/v0/web3/config
200

{
  "data": {
    "chainId": "245022934",  // example
    "rpcUrl": "…",
    "contracts": {
      "voting": "0x123…",
      "receiptNFT": "0xabc…"
    }
  }
}

10.2 On-chain vote (server-assisted)

POST /api/v0/web3/vote

{ "entityType":"brand","entityId":"b_1","signature":"0x...", "address":"0xabc..." }

	•	Server verifies signature (message includes entity + nonce), submits tx to Neon or returns the call data for client to broadcast.
200

{ "data": { "txHash":"0x...", "mirrored": true } }

10.3 Mint receipt NFT (post-purchase)

POST /api/v0/web3/mint-receipt

{ "orderId":"ord_123","address":"0xabc...", "metadataUri":"ipfs://..." }

200

{ "data": { "txHash":"0x...", "tokenId":"1234" } }


⸻

11) Scraper Admin (Playwright + Cheerio)

For curator/admin roles only. The scraper runs headless workers. Jobs saved in scrape_jobs.

11.1 Enqueue job

POST /api/v0/scraping/jobs (curator+)

{
  "source":"farfetch|ssense|mrporter|custom",
  "url":"https://…",
  "parse":"product|brand|designer|collection",
  "priority":"normal|high"
}

201

{ "data": { "jobId":"job_123","status":"queued" } }

11.2 List jobs

GET /api/v0/scraping/jobs?status=queued|running|failed|done (curator+)

11.3 Job result

GET /api/v0/scraping/jobs/:id (curator+)

{ "data": { "id":"job_123", "status":"done", "result": { /* normalized product/brand payload */ } } }


⸻

12) Health & Meta
	•	GET /api/v0/health → { "data": { "ok": true, "version":"v0", "uptime": 12345 } }
	•	GET /api/v0/meta → feature flags, build SHA, environment.

⸻

13) Data Models (IDs & references)

Full schemas live in /docs/BACKEND/MODELS.md. Minimal keys here for API contract:

	•	User: id, email?, passwordHash?, address?, displayName, roles[], stats{likes,saves,votes}
	•	Brand: id, name, type, location, images{hero,thumb}, stats
	•	Designer: id, name, type, location, images, stats
	•	Product: id, brandId, designerId?, title, category, price, currency, images[], retailerUrl, affiliate{network, id}?, metadata{materials, fit, season}?
	•	Submission: id, userId?, tier, status, payload
	•	Vote: id, userId, entityType, entityId, weight(web2|web3), txHash?
	•	ScrapeJob: id, source, url, parse, status, result?, error?

⸻

14) Sorting / Filtering Reference
	•	sort= field name + :asc|desc (multi-sort later)
	•	Brands: popularity, createdAt, updatedAt
	•	Products: price, popularity, createdAt
	•	Filters are additive (AND). Search uses q with text index over name, title.

⸻

15) OpenAPI (to be generated by Agent)

Agent task: Generate /backend/openapi.yaml reflecting this spec (v3.1), and set up:
	•	/backend/scripts/openapi-lint (redocly or spectral)
	•	PR check: validate openapi on CI
	•	Optional: serve docs at /api/docs (swagger-ui / redoc)

⸻

16) Implementation Notes (Agent-only)
	•	Foldering:
	•	backend/server.js (keep) → refactor into src/index.ts if TypeScript is adopted; otherwise src/index.js.
	•	src/routes/*.js per domain; src/controllers/*.js; src/services/*.js; src/models/*.js; src/middleware/*.js; src/utils/*.js.
	•	Keep existing empty files (e.g., brandController.js) but wire them into src/controllers/brand.controller.js, then deprecate via ADR + CHANGELOG.
	•	DB: MongoDB with Mongoose. Create compound indexes for search and popularity.
	•	Cache: Add simple GET response caching for heavy rankings (Redis optional for later).
	•	Telemetry: Morgan logs + basic request ID; optionally pino.

⸻

17) Examples (end-to-end)

Login → list brands → like one
	1.	POST /auth/login → token
	2.	GET /brands?page=1&limit=24&sort=popularity:desc
	3.	POST /interactions/like

{ "entityType":"brand", "entityId":"b_1", "like": true }

Wallet vote (web3 weight)
	1.	POST /auth/wallet/nonce
	2.	User signs message Vote:b_1|nonce:XYZ
	3.	POST /auth/wallet/verify → token
	4.	POST /votes with "weight":"web3"
	5.	(Server proxies to Neon; store txHash)

⸻

18) Acceptance Criteria & Checkpoints

Gate B-0: Scaffolding & middlewares
	•	Express app bootstrapped with CORS, Helmet, rate limiting, error handler.
	•	JWT & RBAC in place; test endpoints health, meta.
	•	zod validation middleware working.

Gate B-1: Auth & Users
	•	Register/login works; SIWE-style wallet flow works.
	•	/users/me returns roles and stats.
	•	Tests added (unit + supertest).

Gate B-2: Catalog
	•	Brands/designers/products list & detail implemented with placeholders.
	•	Pagination, sort, filters verified against UI calls.

Gate B-3: Social
	•	Likes/saves endpoints wired; UI pages consume them.

Gate B-4: Submissions
	•	Create submission; curator review; enqueue scrape for tier=paid.

Gate B-5: Rankings & Voting
	•	Web2 votes stored; rankings endpoint returns correct computed scores.
	•	Web3 vote proxy integrated; handles Neon RPC failures gracefully (retry/backoff).

Gate B-6: Checkout/Affiliate
	•	Resolve & track endpoints implemented; affiliate enrichment works for at least 1 aggregator.

Gate B-7: Scraper Admin
	•	Jobs enqueue/list/get; worker stub created.

Agent: After each gate, update /docs/SCOPE_AND_PHASES.md and wait for APPROVE: Gate B-N.

⸻

19) Non-breaking policy (augment-not-rewrite)
	•	Do not remove existing components or routes used by the Next.js UI.
	•	If contract changes are needed, add new fields/endpoints; mark old ones deprecated with a sunset date in /docs/CHANGELOG.md.
	•	Run UI smoke checks after each API change.

⸻

20) Future (post-MVP)
	•	Webhooks for affiliate conversion confirmations.
	•	Batch on-chain mirroring of Web2 votes.
	•	GraphQL gateway (optional) for data viz pages.
	•	Redis caching & search service.

⸻

21) Env Vars (backend/.env)

PORT=3001
MONGODB_URI=...
JWT_SECRET=...
OPENROUTER_API_KEY=...
NEON_RPC_URL=...
NEON_VOTING_CONTRACT=0x...
NEON_RECEIPT_NFT_CONTRACT=0x...
AFFILIATE_DEFAULT_NETWORK=impact
AFFILIATE_ID=xxxx
CORS_ALLOWED_ORIGIN=https://your-frontend.vercel.app


⸻

22) Test Plan hooks

The dedicated QA docs will go deeper, but minimum here:
	•	Supertest suites for each route.
	•	Contract tests: response shapes match this spec.
	•	Negative tests for validation & RBAC.

⸻

Final Notes for the Agent
	•	Start with Gate B-0 and proceed sequentially.
	•	Generate OpenAPI, validators, controllers, and route wiring per section above.
	•	Keep responses stable for the UI as you connect real DB data.
	•	Write ADRs for any nontrivial deviations and update the CHANGELOG.

⸻
