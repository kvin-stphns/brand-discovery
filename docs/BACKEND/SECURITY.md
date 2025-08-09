
⸻

/docs/BACKEND/SECURITY.md

Backend Security Guidelines

Audience note: The project owner is a novice developer delegating nearly all backend implementation to Cursor’s Agent Mode. The agent must work autonomously, optimize its own code, and fix bugs — pausing only at explicit approval gates. All changes should be additive and non-destructive to the existing structure.

⸻

1. Security Goals

The backend must:
	•	Protect sensitive API endpoints and database operations.
	•	Ensure wallet authentication and blockchain interactions are secure.
	•	Prevent abuse of the affiliate system, scraper endpoints, and ranking logic.
	•	Enforce privacy and compliance standards (GDPR/CCPA alignment where possible).

⸻

2. Authentication & Authorization

2.1 Web2 Authentication
	•	JWT-based authentication:
	•	Use short-lived access tokens + refresh tokens.
	•	Store refresh tokens securely in HTTP-only cookies.
	•	Role-based access control (RBAC):
	•	User: Can browse, vote, save, purchase.
	•	Brand/Designer: Can submit products, edit their listing.
	•	Admin: Full CRUD access to backend.

2.2 Web3 Authentication
	•	Wallet connection via MetaMask or WalletConnect.
	•	Nonce-based message signing for secure login:
	•	Generate unique nonce per login attempt.
	•	Store nonce temporarily in MongoDB.
	•	Verify signed message matches wallet address.

⸻

3. API Endpoint Security
	•	Rate limiting:
	•	Implement using middleware (e.g., express-rate-limit).
	•	Set different thresholds for public vs. authenticated endpoints.
	•	Input validation & sanitization:
	•	Use Joi or Zod schemas for all incoming data.
	•	CORS configuration:
	•	Allow only approved frontend domains.
	•	HTTPS enforcement:
	•	Redirect all HTTP requests to HTTPS in production.

⸻

4. Database Security
	•	Use MongoDB Atlas IP whitelisting.
	•	No direct client access to the database — all queries must go through API layer.
	•	Encrypt sensitive fields at rest (e.g., user email, affiliate IDs).
	•	Apply MongoDB index-level access control to optimize queries and prevent injection.

⸻

5. Web3 & Smart Contract Security
	•	Never expose private keys in code.
	•	Use environment variables for blockchain RPC URLs.
	•	Interact with smart contracts via read/write separation:
	•	Public read endpoints are safe for frontend.
	•	Write operations require backend signing logic.
	•	Include transaction replay protection by validating nonce/order hash.

⸻

6. Scraper Security
	•	Scraper endpoints must require admin API key authentication.
	•	Disable public access to raw scraping functions.
	•	Implement request throttling to avoid IP bans.
	•	Scraper responses should be cached to reduce load and external requests.

⸻

7. Affiliate Logic Security
	•	Validate that affiliate links match the originating brand.
	•	Prevent tampering with affiliate IDs by regenerating links server-side.
	•	Log all outgoing affiliate clicks for fraud detection.

⸻

8. Monitoring & Alerts
	•	Integrate with a logging service (e.g., Winston + Logtail).
	•	Set up alerts for:
	•	Excessive failed login attempts.
	•	Repeated rate-limit triggers.
	•	Unexpected spikes in affiliate clicks.

⸻

9. Deployment Security Checklist
	•	Environment variables stored securely (Vercel, Heroku secrets).
	•	Disable console.log in production — use structured logging instead.
	•	Ensure build artifacts do not expose .env files or secret keys.

⸻

10. Agent Mode Implementation Notes
	•	The agent must analyze current backend code before applying these rules.
	•	Add missing middleware/configuration incrementally, preserving current routes.
	•	After implementation, run automated penetration tests (npm run test:security).
	•	Document all changes in /docs/CHANGELOG.md.

⸻
