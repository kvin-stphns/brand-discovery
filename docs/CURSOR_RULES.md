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
- Run lint/build/tests before proceeding to the next gate

## Reporting at each gate
- What changed, how tested, known limitations, next steps

---
This file is a convenience summary. If any guidance conflicts, prefer `.cursor/rules/agent-mode-rules.mdc`.


---

## Zero Intervention Protocol

- The agent is authorized to proceed through all gates **without requiring human approval** unless:
  1. A build fails and cannot be resolved with autonomous fixes.
  2. Data loss or irreversible destructive change is detected.
  3. Deployment to production is about to occur without passing all QA gates.

- For each gate:
  - Perform all tasks defined in `/docs/SCOPE_AND_PHASES.md`, `/docs/QA/TEST_STRATEGY.md`, and related docs.
  - Perform self-QA using the commands specified in `/docs/QA/TEST_STRATEGY.md`.
  - If all criteria are met, **immediately continue to the next gate**.
  - Update `/docs/CHANGELOG.md` and `/docs/SCOPE_AND_PHASES.md` with progress.

- Do not halt or request manual "APPROVE" unless conditions above are met.

- Always:
  - Keep commits atomic and scoped to the gate or task being worked on.
  - Maintain build/lint passing status between commits.
  - Keep routing, UI, and data structures cohesive and aligned with brand/UI requirements in `/docs/FRONTEND/UI_TASKS.md` and `/docs/FRONTEND/OVERVIEW.md`.

  - Always auto-apply generated changes to the working directory without waiting for manual approval, then immediately commit them with a clear, scoped message before continuing to the next task.