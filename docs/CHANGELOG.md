# Discovery Studios – Project Changelog

> This file logs all notable changes to the repository.  
> Keep entries **chronological** with the newest on top.  
> Include date, summary, and rationale for context.

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

## [2025-08-09] – Gate 1 UI polish (a11y, skeletons, analytics, lint clean)
- Featured/Popular pages: added typed state, analytics view events, and grid skeleton fallbacks.
- CategoryGrid: removed `any`, tightened generics, removed unused params, and refined href builder.
- MegaMenu: removed unused render-prop variables to satisfy lint; preserved functionality.
- NotFound: fixed unescaped apostrophe for a11y/lint.
- Liked/Saved: corrected placeholder image paths to `/public/placeholders/*`.
- Layout: added skip-to-content link and `main` landmark for a11y.
- Frontend lint/build: now clean (no warnings) and green build.
**Rationale:** Complete remaining Gate 1 cohesion items: a11y landmarks, loading states, analytics hooks, and type cleanup.

---