# Discovery Studios – Documentation Index

> **Audience Note:**  
> This project is **already underway**. The frontend has a substantial structure (mega menu, multiple pages) but is missing critical UI elements, routing, and features. The backend is minimal and requires full build-out.  
> The project owner is a **novice developer** who will rely entirely on Cursor’s Agent Mode for completion. The Agent MUST:
> - Analyze existing code structure before acting.
> - Add on top of current work — **do not overwrite** without cause.
> - Optimize its own code, fix bugs, and keep the project cohesive.
> - Pause only at explicit approval gates.

---

## What This Is
This documentation is the **single source of truth** for Cursor’s Agent Mode to rapidly ship a **profit-ready MVP** by:
- Finalizing and polishing the **UI** — beautiful, cohesive, bug-free, on brand.
- Completing **backend** with affiliate checkout logic.
- Implementing **scraper MVP** (1–2 high-priority aggregators).
- Adding **Web3 Phase 1** (wallet connect + on-chain voting + NFT receipts).
- Deploying to production and monitoring post-launch.

---

## Read Me First (Agent Mode)
1. Read `/docs/CURSOR_RULES.md` (summary) and `.cursor/rules/agent-mode-rules.mdc` (authoritative).
2. **Analyze the existing codebase** — identify current structure, missing pieces, and inconsistencies before making changes.
3. Read `/docs/SCOPE_AND_PHASES.md` for the current phase, tasks, and acceptance criteria.
4. When changing file structure or tech choices:
   - Append a short entry to `/docs/CHANGELOG.md`.
   - If altering a prior decision, add an ADR in `/docs/DECISIONS/ADR-*.md`.
5. After completing a phase, write a **summary** in `/docs/SCOPE_AND_PHASES.md` and **wait for human approval**:
   - The human will comment: `APPROVE: Gate <N>`. 

---

## Table of Contents
- **Project Overview** *(Full Context)*
  - `/docs/PROJECT_OVERVIEW.md`
- **Scope & Phases**
  - `/docs/SCOPE_AND_PHASES.md`
- **Architecture**
  - `/docs/ARCHITECTURE.md`
- **Frontend**
  - `/docs/FRONTEND/OVERVIEW.md`
  - `/docs/FRONTEND/UI_TASKS.md`
  - `/docs/FRONTEND/OPTIMIZATIONS.md`
- **Backend**
  - `/docs/BACKEND/OVERVIEW.md`
  - `/docs/BACKEND/API_SPEC.md`
  - `/docs/BACKEND/MODELS.md`
  - `/docs/BACKEND/SECURITY.md`
  - `/docs/BACKEND/SCRAPING.md`
  - `/docs/BACKEND/AFFILIATES.md`
- **Web3**
  - `/docs/WEB3/OVERVIEW.md`
  - `/docs/WEB3/CONTRACTS_SPEC.md`
  - `/docs/WEB3/WALLET_INTEGRATION.md`
  - `/docs/WEB3/DATA_FLOW.md`
- **QA**
  - `/docs/QA/TEST_STRATEGY.md`
  - `/docs/QA/TEST_PLAN_UI.md`
  - `/docs/QA/TEST_PLAN_API.md`
  - `/docs/QA/TEST_PLAN_WEB3.md`
- **Deploy**
  - `/docs/DEPLOY/CI_CD.md`
  - `/docs/DEPLOY/HOSTING.md`
  - `/docs/DEPLOY/OBSERVABILITY.md`
- **Decisions**
  - `/docs/DECISIONS/ADR-0001-mvp-scope.md`
  - `/docs/DECISIONS/ADR-0002-affiliate-first.md`
- **Runbooks**
  - `/docs/RUNBOOKS/RUNBOOK-local-dev.md`
  - `/docs/RUNBOOKS/RUNBOOK-scraper.md`
  - `/docs/RUNBOOKS/RUNBOOK-hotfix.md`
- **Changelog**
  - `/docs/CHANGELOG.md` *(Agent updates as code changes)*

---

## Current Status
- **Phase:** `0 (Baseline docs & CI) → 1 (UI Finalization)`
- **Next Gate:** `Gate 1 – UI completed` *(See `/docs/SCOPE_AND_PHASES.md`)*

---


---

## QA & Deployment

- **/docs/QA/TEST_STRATEGY.md** – Complete testing methodology for all gates, including tools, commands, and pass criteria.
- **/docs/DEPLOYMENT.md** – Full deployment flow from local → staging → production, with Web3/testnet instructions.