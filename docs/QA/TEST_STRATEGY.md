
⸻

/docs/QA/TEST_STRATEGY.md

# QA & Test Strategy

> **Purpose:** Provide an explicit, phase-aware QA plan so autonomous agents and developers can test features with minimal ambiguity.

---

## 1. Testing Principles
- **Gate-Based QA:** QA follows the phase gates defined in `/docs/SCOPE_AND_PHASES.md`.
- **Shift-Left Testing:** Test features as they are built — do not wait for the end of a gate.
- **Automation First:** Where feasible, prefer automated testing over manual checks.
- **Accessibility & Performance:** All gates must pass basic a11y checks and meet performance baselines.

---

## 2. Test Environments
- **Local Development:** `npm run dev` with mock data and all debug logs enabled.
- **Staging:** Full integration with backend/Web3 testnets.
- **Production:** Public environment with production keys and live data.

---

## 3. Tools
- **Unit & Integration Tests:** Jest + React Testing Library.
- **E2E Tests:** Playwright.
- **Linting/Static Analysis:** ESLint (TypeScript config) + Prettier.
- **Accessibility:** axe-core (browser extension) + `@axe-core/playwright`.
- **Performance:** Lighthouse CLI.

---

## 4. Gate-Specific QA

### Gate 1 – UI Completion & Cohesion
- ✅ Verify all pages load without runtime errors.
- ✅ Check image paths, navigation links, and grid layouts.
- ✅ Test keyboard navigation in menus.
- ✅ Run Lighthouse — score ≥ 90 for Performance and Accessibility.
- ✅ Confirm all `/public/placeholders/*` assets load.
- **Commands:**
  ```bash
  cd frontend
  npm run lint
  npm run test
  npx playwright test --grep @gate1

Gate 2 – Backend MVP
	•	✅ API endpoints return correct mock/real data.
	•	✅ Security headers present (per /docs/BACKEND/SECURITY.md).
	•	✅ No sensitive data in responses.
	•	✅ Basic affiliate tracking works.
	•	Commands:

npm run test:backend
npx playwright test --grep @gate2



Gate 3 – Web3 Phase 1
	•	✅ Wallet connect/disconnect works (testnet).
	•	✅ Transactions confirmed on chain.
	•	✅ UI updates after transaction events.
	•	Commands:

npx playwright test --grep @web3



Gate 4 – QA & Launch
	•	✅ Full regression test across all features.
	•	✅ Cross-browser checks (Chrome, Firefox, Safari).
	•	✅ Mobile responsiveness tested on 3 breakpoints.
	•	✅ Final Lighthouse score ≥ 95 Performance, ≥ 95 Accessibility.

⸻

5. Test Data & Mocks
	•	Local: Use frontend/lib/api/mock.ts.
	•	Staging: Connect to backend staging API + Web3 testnet.
	•	Production: Real API + mainnet.

⸻

6. Reporting
	•	After each gate QA pass:
	•	Update /docs/SCOPE_AND_PHASES.md with test status.
	•	Log issues in /docs/CHANGELOG.md if they required fixes.

---

