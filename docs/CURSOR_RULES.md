# Cursor Agent Execution Rules

> Authoritative ruleset for autonomous operation in this repository.

- Owner skill level: Novice. Agent must self-direct, self-correct, and minimize human intervention.
- Primary goal: Ship a production-ready, revenue-capable MVP following the sequence in `/docs/SCOPE_AND_PHASES.md`.
- Non-negotiables: Augment-not-rewrite, keep UI cohesive, document changes, pause at gates.

## Where the rules live
- Full rules: `.cursor/rules/agent-mode-rules.mdc` (authoritative)
- Index and scope: `/docs/INDEX.md`, `/docs/SCOPE_AND_PHASES.md`
- Frontend: `/docs/FRONTEND/OVERVIEW.md`
- Backend: `/docs/BACKEND/OVERVIEW.md`, `/docs/BACKEND/API_SPEC.md`
- Web3: `/docs/WEB3/OVERVIEW.md`

## Phase gates (summary)
- Gate 0: Baseline docs and CI basics
- Gate 1: UI completion & cohesion
- Gate 2: Backend API + affiliate + scraper MVP
- Gate 3: Web3 Phase 1 (wallet + voting)
- Gate 4: QA & Launch

## Required behavior
- Maintain Swedish-grid, Balenciaga-inspired UI; avoid regressions
- Implement affiliate checkout and Web3 integrations per docs
- Keep dependencies current; remove unused when safe
- Run lint/build/tests before requesting gate approval

## Reporting at each gate
- What changed, how tested, known limitations, next steps

---
This file is a convenience summary. If any guidance conflicts, prefer `.cursor/rules/agent-mode-rules.mdc`.