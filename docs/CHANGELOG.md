# Discovery Studios – Project Changelog

> This file logs all notable changes to the repository.  
> Keep entries **chronological** with the newest on top.  
> Include date, summary, and rationale for context.

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