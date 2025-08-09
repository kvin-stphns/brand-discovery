### **`/docs/DEPLOYMENT.md`**
```markdown
# Deployment Guide

> **Purpose:** Provide a step-by-step deployment process for local, staging, and production environments.

---

## 1. Environments
- **Local Development**
  - Purpose: Feature development, initial QA.
  - Command: `npm run dev`
- **Staging**
  - Purpose: Pre-production QA, integration testing.
  - Hosted: staging.example.com
- **Production**
  - Purpose: Public, revenue-capable MVP.

---

## 2. Environment Variables
Create `.env.local`, `.env.staging`, `.env.production` as needed:

NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WEB3_NETWORK=
NEXT_PUBLIC_WALLET_CONNECT_ID=

Do **not** commit `.env*` files.

---

## 3. Deployment Workflow

### Local → Staging
1. **Pull latest changes**:
   ```bash
   git pull origin main

	2.	Run QA locally:

npm run lint
npm run build
npm run test


	3.	Deploy to staging:
	•	If using Vercel:

vercel --prod --confirm --scope <your-scope> --env STAGING


	•	Else: Push to staging branch.

	4.	Verify staging:
	•	Run /docs/QA/TEST_STRATEGY.md Gate QA steps.
	•	Test Web3 on testnet.

⸻

Staging → Production
	1.	Confirm staging is clean (no blocking issues).
	2.	Merge staging into main:

git checkout main
git merge staging
git push origin main


	3.	Deploy:
	•	Vercel auto-deploys main.
	•	Else run:

npm run build
npm run start



⸻

4. Web3 Deployment Notes
	•	Always deploy first to a testnet for Gate 3 QA.
	•	Confirm contract addresses match /docs/WEB3/OVERVIEW.md.
	•	Post-deploy, verify:
	•	Wallet connect/disconnect
	•	Transaction events update UI

⸻

5. Post-Deployment Verification
	•	Run Lighthouse on production URL.
	•	Test on desktop + mobile breakpoints.
	•	Check console/network tab for errors.
	•	Verify payment/affiliate/Web3 flows.

⸻

6. Rollback Procedure

If deployment fails:
	1.	Revert to previous successful commit:

git checkout <commit-hash>
git push origin main --force


	2.	Redeploy.

⸻

Note: This doc assumes Vercel. If deploying elsewhere, adjust commands but keep QA and verification steps unchanged.

---
