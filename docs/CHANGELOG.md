# Discovery Studios – Project Changelog

> This file logs all notable changes to the repository.  
> Keep entries **chronological** with the newest on top.  
> Include date, summary, and rationale for context.

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