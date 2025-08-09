
---

# SCOPE\_AND\_PHASES.md

> **Audience note (Cursor Agent + human):**
> The project owner is a novice who will not make manual code edits. You (the Agent) must **augment—not rewrite** the existing codebase, maintain visual brand cohesion (Balenciaga-inspired grid aesthetic), fix your own regressions, and pause at **approval gates**. Use the acceptance criteria and self-checks below before asking for approval.

---

## 0) How to Use This Document

* **You (Agent)** own execution. Run tasks in order, stick to “augment-not-rewrite,” and update:

  * `/docs/CHANGELOG.md` after each code change set.
  * `/docs/DECISIONS/ADR-*.md` when you change any architectural choice.
* **Approval gates** are explicit. After finishing a phase, post a short summary PR comment and wait.
  The human will reply with:

  * `APPROVE: Gate <N>` → proceed
  * `REVISE: Gate <N>` → fix requested items and resubmit.

---

## 1) Time & Effort Estimates

These estimates reflect an already-started project with working UI scaffolding, missing pages, and a mostly-empty backend.

| Track                                       |     Best-Case | Realistic (Most Likely) |     Worst-Case | Notes                                                                                                                            |
| ------------------------------------------- | ------------: | ----------------------: | -------------: | -------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend augmentation**                   |  **2–3 days** |            **4–6 days** |   **7–9 days** | Includes finishing pages, routing, consistency fixes, polish, accessibility, and design QA across devices.                       |
| **Backend + scraping MVP**                  |  **3–5 days** |            **6–8 days** |  **9–12 days** | Auth, brands/products API, ranking/votes API, scraper MVP (1–2 aggregators), affiliate redirect, Mongo models, JWT, rate limits. |
| **Web3 Phase 1 (wallet + on-chain voting)** |  **2–3 days** |            **3–5 days** |   **6–7 days** | Neon EVM contracts for voting, wallet connect UI, backend relay, event sync to Mongo.                                            |
| **Combined MVP (end-to-end)**               | **7–10 days** |          **12–16 days** | **20–28 days** | Parallelize FE/BE where possible; biggest risks are scraper anti-bot + contract testnet hiccups.                                 |

**Parallelization guidance**

* Day 1–2: Agent finalizes FE structure & adds missing pages while scaffolding backend (models/routes) in parallel.
* Day 3–6: Scraper MVP & affiliate redirect; FE hooks to live API.
* Day 6–10: Web3 Phase 1 (wallet + voting) and UI polish passes.

---

## 2) MVP Scope (What We’re Shipping)

**Goal:** A revenue-capable MVP where users can **discover brands**, **like/save**, **vote on rankings (on-chain)**, and **click out via affiliate links**. Basic submission flow included.

**Monetization in MVP**

* **Affiliate checkout/redirect** (primary).
* **Paid submission** (fast-track review) – charge via Stripe link (Phase 1.5).

---

## 3) Phases, Deliverables, and Approval Gates

> Each phase contains: tasks, acceptance criteria, self-checks, and artifacts the Agent must produce before asking for approval.

### Phase 0 — Baseline & Safety (0.5 day)

**Tasks**

* Create/verify `/docs` structure (index, overview, this file, architecture placeholders).
* Set up **ESLint + Prettier + TypeScript strict-ish** in FE and BE.
* Add **GitHub Actions**: type check, lint, build (FE), test (placeholder).
* Add **CHANGELOG.md** and **ADR template**.

**Acceptance Criteria**

* CI passes on PR: `lint`, `typecheck`, `build`.
* `.env.example` files documented; secrets **not** committed.

**Agent Self-Check**

* No mass rewrites.
* No broken builds.
  **Gate 0 →** Request approval with CI screenshot and summary.

---

### Phase 1 — Frontend Completion & Cohesion (4–6 days realistic)

**Objective:** Finish all missing pages, fix routing, and enforce unified visual language.

**Tasks**

1. **Audit & Align**

   * Crawl `frontend/` to map routes → `/docs/FRONTEND/ROUTES_MAP.md`.
   * Identify inconsistent patterns (e.g., `pages/` vs `app/`, CSS modules vs Tailwind, duplicated utils).
   * Normalize imports (`@/*` aliases), ensure all images use `next/image`.

2. **Complete Missing Pages & Hooks**

   * Bottom Nav pages: **Login, Saved, Liked, Submissions, About** (most are present; finish logic & routing).
   * Footer pages: **Contact, FAQ, Privacy, Terms** (Terms missing).
   * **Featured**, **Popular** pages (present → wire to API later; keep mock data behind a toggle).
   * **Brand**, **Designer**, **Product** details pages (present → unify layout variants).
   * **Rankings & Leaderboard** (skeleton UIs + placeholder data provider).
   * **Interactive Map stub** (lazy-loaded component with mocked data + TODO).

3. **Design System & Cohesion**

   * Extract shared **layout primitives** (grid wrappers, dividers, spacers).
   * Extract **typography scale** & utility classes to a single file; remove ad-hoc inline styles.
   * Add **Theme QA**: ensure screens (`mobile`, `tablet`, `desktop`) match Tailwind config; fix off-by-one breakpoints.

4. **UX Polish**

   * Keyboard navigation + focus states.
   * Ensure **mega menu** and **mobile menu** interop (no scroll traps, proper close on route change).
   * Add error/empty/loading states for all data-driven components.

5. **Data Shims (for easy backend swap later)**

   * Introduce `lib/apiClient.ts` with typed functions (e.g., `getFeatured()`, `getBrand(id)`, `voteOnChain(input)`), returning mocks when `NEXT_PUBLIC_API_ENDPOINT` is empty.

**Acceptance Criteria**

* All pages route without 404s; shared header/footer present everywhere.
* No UI regressions on mobile/tablet/desktop (spot-check with screenshots in PR).
* LCP \~ good enough (lazy-load heavy imagery, `priority` only above the fold).
* **Design review checklist** in `/docs/FRONTEND/OPTIMIZATIONS.md` all green.

**Agent Self-Check**

* Lighthouse (desktop & mobile) JSON reports attached to PR.
* Zero TypeScript errors; minimal `any`.
* No visual drift from brand aesthetic.
  **Gate 1 →** Request approval with route map + screenshots + Lighthouse summary.

---

### Phase 2 — Backend API + Scraper MVP + Affiliate (6–8 days realistic)

**Objective:** Stand up Express + Mongo backend, expose typed endpoints, and ship a resilient scraper MVP for **1–2 aggregators**.

**Tasks**

1. **Backend Scaffolding**

   * Files: `server.ts`, `/routes`, `/controllers`, `/models`, `/middleware`, `/services`.
   * Middleware: CORS, JSON, **rate limiting**, `helmet`, request logging.
   * Auth: `/auth/register`, `/auth/login`, `/auth/refresh` with JWT (httpOnly cookie) and role field: `user|admin`.

2. **Models (Mongo + Mongoose)**

   * `User` (email, walletAddress?, roles, savedIds\[], likedIds\[]).
   * `Brand`, `Designer`, `Product` (normalized; images, tags, links).
   * `Vote` (userId, entityType, entityId, weight, txHash?).
   * `Submission` (type, links, status, paidFlag, auditTrail).
   * Indexing strategy for list pages and search.

3. **APIs (v1)**

   * `GET /brands`, `GET /brands/:id`
   * `GET /designers`, `GET /designers/:id`
   * `GET /products`, `GET /products/:id`
   * `POST /votes` (web2 store + optional on-chain relay later)
   * `POST /submissions` (write + email/webhook stub)
   * `GET /rankings` (aggregated by likes + votes; return deterministic mock until Web3 sync)
   * `GET /affiliate/redirect?productId=…` (resolves outbound URL)

4. **Scraper MVP**

   * Targets: **SSENSE** and **FARFETCH** (adjust if blocked). Add **`/docs/BACKEND/SCRAPING.md`** with site-specific notes.
   * Implement **Playwright** fallback when Cheerio fails; rotate headers, **backoff**, and **error taxonomy**.
   * Persist normalized `Product` with `source`, `brand`, `slug`, `price`, `images`, `affiliateLink?`.
   * CLI + CRON entrypoint: `yarn scrape:ssense` | `yarn scrape:farfetch`.
   * Add “dry-run mode” and sample fixtures to run without network.

5. **Affiliate Redirect**

   * Middleware that reads `?utm`/`?aff` params, signs click event (server timestamp, IP hash), stores in `Click` collection.
   * Redirect 302 to final affiliate URL or fallback brand page.

**Acceptance Criteria**

* `docker-compose up` spins Mongo locally; `yarn dev` runs server without errors.
* OpenAPI (Swagger) JSON at `/docs` reflects all v1 routes.
* Scraper fetches at least **50 items** per aggregator fixture, normalized, and visible in FE via `apiClient`.
* Affiliate redirect works (tested with fake links).

**Agent Self-Check**

* Run **supertest** integration tests for main endpoints.
* Scraper: run twice; confirm **idempotency** and product dedupe.
* Update `/docs/BACKEND/API_SPEC.md` with final response shapes.
  **Gate 2 →** Request approval with Swagger link + sample DB dump + test results.

---

### Phase 3 — Web3 Phase 1 (Wallet + On-Chain Voting) (3–5 days realistic)

**Objective:** Add Neon EVM contract(s) for voting; integrate wallet connect; sync on-chain votes to Mongo.

**Tasks**

1. **Wallet Integration**

   * Add **WalletConnect / MetaMask** (wagmi + viem).
   * “Connect Wallet” buttons on Login + Nav; persist `walletAddress` on user profile server-side.

2. **Contracts**

   * `VotingRegistry` (Neon EVM testnet):

     * `vote(entityType, entityId, weight)`; emits `Voted(address, entityType, entityId, weight, timestamp)`.
     * Role: `VOTER_ROLE` for all; `PAUSER_ROLE` for admin.

3. **Backend Relay + Sync**

   * Endpoint: `POST /web3/vote` signs and sends tx (server relayer or user wallet direct; support both).
   * Event listener (polling or websocket) writes `Vote` with `txHash` to Mongo.
   * “Web2→Web3” batch job (optional): periodically commits buffered web2 votes on-chain.

4. **Frontend Hooks**

   * `useVote()` handles optimistic UI, falls back on web2 if wallet absent.
   * Rankings pages read combined score (configurable weights).

**Acceptance Criteria**

* Contract deployed to testnet; address stored in `.env`.
* Voting from UI updates **both** on-chain (when wallet connected) and DB; leaderboard reflects it.
* Basic anti-spam (rate limit + 1 vote per entity per 24h unless wallet-signed).

**Agent Self-Check**

* E2E flow: connect → vote → see updated ranking; DB row shows `txHash`.
* Emit a small **Contract README** with ABI + functions in `/docs/WEB3/CONTRACTS_SPEC.md`.
  **Gate 3 →** Request approval with contract address + short demo video/gif + DB snapshot.

---

### Phase 4 — QA, Hardening, and MVP Launch (2–4 days realistic)

**Objective:** Bug bash, stabilize, deploy.

**Tasks**

* **Automated checks**: Lighthouse regression, vitest unit tests for FE utils, supertest for APIs, contract call smoke tests.
* **Content QA**: sample seed data; ensure pages do not break with missing fields.
* **Deploy**:

  * FE → **Vercel**
  * BE → **Railway/Render/Heroku** (pick one) with Mongo Atlas
  * Pin static Web3 assets (if any) to **IPFS** (optional).
* **Monitoring**: Sentry (FE/BE), Health check endpoint `/healthz`, up-time pings.

**Acceptance Criteria**

* Green CI/CD; staging URLs shared.
* No P0 bugs (crashes, broken routes) and no P1 visual blockers.

**Agent Self-Check**

* Run the **UI test plan** from `/docs/QA/TEST_PLAN_UI.md`.
  **Gate 4 →** Request approval for prod. After approval, promote to production.

---

## 4) Non-Negotiables for the Agent

* **Augment, don’t rewrite.** Preserve file structure where possible. If refactors are necessary, isolate them, explain in ADR, and keep PRs scoped.
* **Design cohesion.** Maintain the Balenciaga-inspired, grid-forward aesthetic. No random components or rogue spacing.
* **Accessibility & performance** matter (keyboard nav, focus states, image optimization, lazy loading).
* **Document everything you change.** Keep `/docs/CHANGELOG.md` current.

---

## 5) Risk Register (with Mitigations)

| Risk                        | Impact | Likelihood | Mitigation                                                                                                                      |
| --------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Scraper blocks / anti-bot   | High   | Med        | Rotate headers, exponential backoff, headless browser fallback, cache fixtures; run on server with residential proxy if needed. |
| Contract deployment hiccups | Med    | Med        | Use Neon testnet; keep a pure web2 fallback for votes.                                                                          |
| Design regressions          | Med    | Med        | Snapshot key pages, run visual checks, keep shared layout primitives.                                                           |
| Performance regressions     | Med    | Med        | Lighthouse budget, code-split heavy components, defer non-critical JS.                                                          |
| Data inconsistencies        | High   | Low        | Strict models, validation layer, idempotent upserts, DTOs in API.                                                               |

---

## 6) Definition of Done (MVP)

* FE: all pages functional, visually consistent, responsive, and connected to live APIs.
* BE: stable API with OpenAPI docs, scraper cron ingest populating products for at least **1–2 aggregators**.
* Web3: wallet connect + on-chain voting live on testnet; rankings reflect mixed scoring.
* Deploy: FE on Vercel, BE on managed host + Mongo Atlas; Sentry live; health checks green.
* Monetization: affiliate redirect working; paid submission button wired to Stripe link (Phase 1.5 ticket created).

---

## 7) How to Ask for Approval

At the end of each phase, open a PR with:

* **Checklist** of acceptance criteria (ticked).
* **Screenshots / short video** for UX features.
* **Links**: staging FE URL, Swagger docs, contract address (if applicable).
* **Changelog** diff.
  Then post a comment:

> “**Gate N complete** — awaiting approval.”

The human will reply:

* `APPROVE: Gate N` → proceed
* `REVISE: Gate N` → Agent must fix items and resubmit.

---

## 8) Next Files Agent Should Read/Write

* `/docs/FRONTEND/OVERVIEW.md` – Augment-not-rewrite rules, UI tasks, and style cohesion checklist.
* `/docs/BACKEND/OVERVIEW.md` + `/docs/BACKEND/API_SPEC.md` – Models + endpoints to implement.
* `/docs/WEB3/OVERVIEW.md` – Contract + wallet strategy.
* `.cursorrules` – Execution rules (strict), including approval logic, self-checks, and safety rails.

---

**End of SCOPE\_AND\_PHASES.md**

---

## Gate 1 Status (Agent note – 2025-08-09)
- Per tidy patch: fixed Web3 wallet doc filename, tightened Next image config (local only), improved Hero (reduced-motion guard + skip link), corrected product placeholder paths, added not-found page, and fixed discover/category link targets.
- Progress: Added API data shims (client + mocks), centralized nav link building, implemented GeoMap stub, refactored `/featured` and `/popular` to use mocks, documented route map.
- Frontend builds successfully; lint warnings remain acceptable for now and will be addressed during the remaining UI cohesion tasks.

---