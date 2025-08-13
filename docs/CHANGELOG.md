# Discovery Studios – Project Changelog

> This file logs all notable changes to the repository.  
> Keep entries **chronological** with the newest on top.  
> Include date, summary, and rationale for context.

---

## [2025-08-09] – Gate-1 UI hotfix: hero overlay via portal + sentinel; Popular z-index/parallax; build green
- Hero: added sentinel and portal for fixed DISCOVER button; guarded parallax with prefers-reduced-motion and rAF.
- Popular: background moved to -z-10, content uses relative z-10; removed extreme offsets; gentler translateY parallax; ensured overflow-hidden on cards.
- Verified no conflict markers; frontend lint/build green.

---

## [2025-08-09] – Gate 1 complete: routing report, types tightened, tokens sweep, toast util
- Added token utilities in `globals.css` (trk-tight/mid, accent) and applied to `CategoryGrid`.
- Tightened mock types (removed `any`, disallowed `mixed` in GridItem); fixed `/discover` page typing.
- Added minimal toast system (`lib/toast.tsx`) and integrated in `app/layout.tsx`.
- Implemented `scripts/route-crawl.js` and generated `/docs/QA/ROUTES_REPORT.md`.
- Frontend and backend lint/build pass. Proceeding to Gate 2.
**Rationale:** Finish Gate 1 acceptance items to ensure a cohesive, accessible UI baseline.

---

## [2025-08-09] – Gate 0 build/lint green; Gate 1 UI cohesion pass (typed pages, a11y, skeletons)
- Backend: added ESLint config and scripts; `npm run lint` and `npm run build` (no-op) now pass. Kept server plain JS.
- Frontend: fixed a11y (skip link, `Menu.Button` aria, ESC close), resolved TypeScript typing on Featured/Popular, added analytics view/nav hooks, loading skeletons in `CategoryGrid`, and created `/terms` page.
- Fixed Next lint warning in `not-found` by escaping apostrophe.
- Ensured builds pass for both apps; only non-blocking lint warnings remain to be addressed during continued type cleanup.
**Rationale:** Establish stable baseline before proceeding with Gate 1/2/3 implementation.

---

## [2025-08-09] – Gate 1 UI cohesion progress (maps, mocks, nav helpers)
- Added `frontend/lib/api/client.ts` and `frontend/lib/api/mock.ts` for data shims; refactored `/featured` and `/popular` to consume mocks.
- Centralized menu link building via `frontend/lib/nav.ts`; updated `MegaMenu.tsx` to use it.
- Implemented lightweight `GeoMap` component and wired `/discover/map` to render it.
- Added `frontend/lib/analytics.ts` (no-op tracking util).
- Removed duplicate `frontend/lib/utils.js` (using `utils.ts`).
- Documented routes in `/docs/FRONTEND/ROUTES_MAP.md`.
**Rationale:** Complete Gate 1 data shims, routing cohesion, and map stub with minimal refactor; prepare for backend swap.

---

## [2025-08-09] – Baseline rules & UI Gate 1 prep (tidy patch)
- Added `/docs/CURSOR_RULES.md` to summarize execution rules and pointed to `.cursor/rules/agent-mode-rules.mdc`.
- Fixed docs index link and renamed Web3 wallet doc to `WALLET_INTEGRATION.md`.
- Removed Next image remote config (MVP only uses local public images).
- Fixed broken image paths in `CategoryGrid` and `/discover` to use `/public/placeholders/*`.
- Added `frontend/app/not-found.tsx` for friendly 404s.
**Rationale:** Align code and docs; eliminate broken assets; prepare for Gate 1 acceptance checks.

---

## [YYYY-MM-DD] – Initial Setup
- Created `/docs/CURSOR_RULES.md` with complete phase and style rules.
- Added baseline documentation for backend, frontend, and web3.
- Established approval gates and alwaysApply directive.
**Rationale:** Provide Cursor with complete autonomous execution framework.

---

## [YYYY-MM-DD] – Example Entry
- **Added:** `/src/components/InteractiveMap.tsx`
- **Modified:** `/src/pages/Brands.tsx` to integrate InteractiveMap component.
- **Removed:** Deprecated static brand list.
**Rationale:** Implement premium discovery experience via interactive map UI.

---

## [2025-08-09] – Gate 1 UI Auto-Fix Sweep
- Unified internal routing via `lib/nav.ts::hrefFor`; updated MegaMenu including distinct `/explore` vs `/discover`, and mapped Discover → Location to `/discover/map`.
- Added `/explore` page (mixed feed) distinct from `/discover`.
- Popular cards z-index/parallax fixes; Hero button fixed overlay via portal + sentinel (earlier hotfix).
- Added minimal cart (Zustand) with navbar count and drawer; wired Product “ADD TO CART”.
- Regenerated routes map and routes report; build green.

---

## [2025-08-13] – Gate 1: Rankings Overhaul
- Rankings Overhaul: Leaderboard Hub, list sub-sections, map rankings, menu routing, build green.
  - Enhanced rankings with timeframe, category, and sorting chips; modes: Leaderboard/List/Map.
  - New components: `frontend/components/rankings/LeaderboardHub.tsx`, `LeaderboardTable.tsx`, `Charts.tsx`, `RankingsList.tsx`, `MapLeaderboard.tsx`.
  - New data layer: `frontend/lib/rankings/types.ts`, `frontend/lib/rankings/mock.ts`.
  - Routes wired: `/rankings`, `/[category]/rankings`, sub-routes for `most-liked`, `most-viewed`, `recently-liked`, and `location`.
  - Menus updated to generate rankings routes via `hrefFor(...)`.
  - Lint/build passed; routes report updated.

---

## Gate 2 - Backend MVP
- Unified backend entry: `server.js` now uses `src/app.js`; routes mounted under `/api`.
- Added health endpoints: `GET /` and `GET /healthz`.
- Hardened Express: helmet, cors, json limit, morgan, trust proxy, rate-limits (global and stricter for `/auth` and `/checkout`).
- DB utils: retry with exponential backoff and graceful shutdown on SIGINT/SIGTERM.
- Models added: `User`, `Designer`, `Product`, `Vote`, `Click`.
- Auth: JWT magic login (`POST /api/auth/login`), `GET /api/auth/me`, RBAC guard.
- Validation: Joi-based `validate()` middleware for POST/PUT and query params.
- Routes implemented/extended: brands (CRUD admin create/update), designers, products (filters), votes (create + summary), rankings aggregates, affiliate checkout with non-blocking Click logging.
- Tests: healthz, brand admin create+list, checkout redirect.
- `.env.example` with required env vars.