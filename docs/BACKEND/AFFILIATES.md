
⸻

/docs/BACKEND/AFFILIATES.md

Affiliate Integration & Revenue Logic

Audience note: The project owner is a novice developer relying entirely on Cursor’s Agent Mode for affiliate integration. The agent must work autonomously, preserve existing backend structure, and only add or fix — never rewrite working code unless a bug is found.

⸻

1. Purpose

The affiliate system will serve as a primary monetization channel by generating revenue from:
	•	Fashion aggregator networks.
	•	Direct brand affiliate programs.
	•	Paid submissions from brands/designers.

The system must be:
	•	Automated: Minimal manual input for adding or updating affiliate sources.
	•	Secure: No manipulation of affiliate IDs by the frontend.
	•	Trackable: Full analytics on clicks, conversions, and revenue.

⸻

2. Affiliate Link Flow
	1.	User clicks a product in the frontend.
	2.	Backend receives a product ID and user context (if logged in).
	3.	Backend regenerates the affiliate link from stored templates:
	•	Pull from MongoDB (product → affiliate source → link template).
	4.	Backend redirects user to the affiliate URL with appended tracking parameters.
	5.	Log the click for analytics & fraud detection.

⸻

3. Data Model

Extend /docs/BACKEND/MODELS.md with:

AffiliateSource {
  _id: ObjectId,
  name: string,            // Brand or aggregator name
  network: string,         // e.g., "Rakuten", "Awin", "Direct"
  baseUrl: string,         // Base affiliate landing page
  linkTemplate: string,    // Template for product-specific link
  trackingParams: object,  // { utm_source, utm_medium, affiliate_id, etc. }
  active: boolean,         // Enable/disable source
  lastChecked: Date,       // Last time verified active
}

AffiliateClick {
  _id: ObjectId,
  productId: ObjectId,
  userId: ObjectId | null,
  affiliateSourceId: ObjectId,
  timestamp: Date,
  ip: string,
  userAgent: string
}


⸻

4. API Endpoints

Public
	•	GET /affiliate/:productId
	•	Redirects to affiliate link for given product.
	•	Must regenerate link server-side.

Admin
	•	POST /admin/affiliate-source
	•	Add new affiliate source.
	•	PATCH /admin/affiliate-source/:id
	•	Update template or tracking params.
	•	DELETE /admin/affiliate-source/:id
	•	Disable affiliate source.

⸻

5. Networks to Target

The MVP should integrate at least one from each:
	•	Aggregators:
	•	Farfetch Partner Program
	•	Lyst Affiliates
	•	SSENSE Partners
	•	Direct:
	•	Balenciaga (if available)
	•	Prada
	•	Gucci
	•	Paid Submissions:
	•	API endpoint for brand to pay & submit products (Phase 2).

⸻

6. Fraud Prevention
	•	Affiliate links regenerated only on backend.
	•	Validate product source matches affiliate ID.
	•	Throttle click events from same IP within short intervals.
	•	Log abnormal patterns for review.

⸻

7. Analytics & Reporting
	•	Count unique clicks per product per day.
	•	Store metadata (IP, user agent) for fraud analysis.
	•	Export click data for revenue reconciliation with affiliate networks.

⸻

8. Agent Mode Implementation Notes
	•	Agent should detect existing affiliate-related code and merge changes.
	•	Build admin CRUD pages in backend for affiliate sources.
	•	Ensure all affiliate clicks are logged before redirect.
	•	After implementation, test with dummy affiliate links before going live.
	•	Document all changes in /docs/CHANGELOG.md.

⸻
