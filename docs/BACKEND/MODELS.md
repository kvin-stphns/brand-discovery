
⸻

/docs/BACKEND/MODELS.md

Audience & Mode: The project owner is a novice developer. Cursor’s Agent Mode is expected to implement these models, write migrations/seeders, and self-verify. Do not rewrite existing UI; augment safely.
Rule of engagement: If the codebase already has overlapping models, the Agent must analyze first, generate an ADR summarizing diffs, and then augment (do not delete) unless explicitly approved.

0) High-level data model (MVP scope)

Core objects (minimum to earn revenue + validate Web3 flows):
	•	User (accounts + wallet binding)
	•	Brand, Designer, Product (catalog)
	•	Submission (paid/free intake → curation → scrape)
	•	Vote (Web2 vote with optional on-chain mirror)
	•	OnChainReceipt (mapping on-chain tx for votes/NFT receipts)
	•	AffiliateLink (normalized outbound, UTM, aggregator linking)
	•	ScrapeJob / ScrapeResult (playwright/cheerio, per-source adapter)
	•	RankingSnapshot (denormalized for fast UI leaderboards)
	•	SavedItem / LikedItem (user collections)
	•	OrderProof (optional MVP+; NFT proof-of-purchase mapping)

Note: “Designer” may be optional for some brands; keep relations flexible.

⸻

1) Global conventions
	•	IDs: Mongo ObjectId for internal; expose short slug for URLs (unique, lowercase).
	•	Soft delete: isDeleted: Boolean, deletedAt: Date on all top-level content.
	•	Timestamps: createdAt, updatedAt (Mongoose timestamps).
	•	Ownership auditing: createdBy, updatedBy (ObjectId), optional.
	•	JSON shape: Favor denormalized read fields where they reduce N+1 UI queries.
	•	Validation: Mongoose schema validators + additional zod validators at API layer.
	•	Indexing: See each model; always add compound indexes for hot queries.
	•	Multi-tenancy: N/A; but namespace source on scraped items for future expansion.
	•	Web3: Keep chain data in separate documents so we can rotate networks/contracts.

⸻

2) Models

Below are Mongoose schemas (TypeScript flavored JSDoc) + example documents and indexes. Cursor should create these in backend/models/ and export types. If a model exists already, diff + migrate instead of overwrite.

2.1 User

Represents Web2 account + optional wallet binding.

// backend/models/userModel.ts
import mongoose, { Schema, Types } from 'mongoose';

const WalletSchema = new Schema({
  chain: { type: String, enum: ['neon', 'ethereum', 'solana'], default: 'neon', index: true },
  address: { type: String, required: true, lowercase: true, index: true },
  verifiedAt: { type: Date },
  primary: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new Schema({
  email: { type: String, lowercase: true, trim: true, index: true },
  emailVerifiedAt: Date,
  passwordHash: String, // if using password auth in MVP
  oauthProviders: [{
    provider: { type: String, enum: ['google','apple','twitter','github'] },
    providerId: String
  }],
  wallets: [WalletSchema],
  role: { type: String, enum: ['user','curator','admin'], default: 'user', index: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  likedCount: { type: Number, default: 0 },
  savedCount: { type: Number, default: 0 },
  voteCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

UserSchema.index({ 'wallets.address': 1 });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

Example:

{
  "_id": "65f1...",
  "email": "user@example.com",
  "wallets": [
    { "chain": "neon", "address": "0xabc...", "verifiedAt": "2025-03-01T10:00:00Z", "primary": true }
  ],
  "role": "user",
  "username": "bykevin",
  "slug": "bykevin"
}


⸻

2.2 Brand

// backend/models/brandModel.ts (augment existing)
import mongoose, { Schema } from 'mongoose';

const BrandSchema = new Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  type: { type: String, enum: ['Streetwear','High Fashion','Avant Garde','Hybrid','Techwear','Workwear','Other'], index: true },
  headquarters: { city: String, country: String, region: String },
  foundedYear: Number,
  website: String,
  socials: {
    instagram: String,
    twitter: String,
    facebook: String
  },
  images: [{ url: String, label: String }],
  score: { type: Number, default: 0 }, // computed (votes, engagement)
  popularity: { type: Number, default: 0 }, // daily/weekly
  isFeatured: { type: Boolean, default: false, index: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  source: { type: String, enum: ['manual','scraped'], default: 'manual', index: true },
  meta: Schema.Types.Mixed
}, { timestamps: true });

BrandSchema.index({ type: 1, popularity: -1 });
BrandSchema.index({ score: -1 });

export default mongoose.models.Brand || mongoose.model('Brand', BrandSchema);


⸻

2.3 Designer

// backend/models/designerModel.ts
import mongoose, { Schema } from 'mongoose';

const DesignerSchema = new Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  brandId: { type: Schema.Types.ObjectId, ref: 'Brand', index: true }, // optional
  location: { city: String, country: String },
  bio: String,
  images: [{ url: String, label: String }],
  type: { type: String, enum: ['Streetwear','High Fashion','Avant Garde','Hybrid','Techwear','Workwear','Other'], index: true },
  score: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

DesignerSchema.index({ brandId: 1 });

export default mongoose.models.Designer || mongoose.model('Designer', DesignerSchema);


⸻

2.4 Product

Supports affiliate checkout + aggregator links.

// backend/models/productModel.ts
import mongoose, { Schema } from 'mongoose';

const PriceSchema = new Schema({
  currency: { type: String, default: 'USD' },
  current: { type: Number, required: true },
  original: { type: Number },
  lastSeenAt: Date
}, { _id: false });

const RetailerSchema = new Schema({
  name: String,                 // e.g., "SSENSE"
  productUrl: String,           // canonical URL on retailer
  affiliateUrl: String,         // outbound with tracking
  source: { type: String, enum: ['ssense','farfetch','mrporter','unknown'], index: true },
  lastCheckedAt: Date,
  availability: { type: String, enum: ['in_stock','out_of_stock','unknown'], default: 'unknown' }
}, { _id: false });

const ProductSchema = new Schema({
  brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
  designerId: { type: Schema.Types.ObjectId, ref: 'Designer' },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: { type: String, enum: ['Tops','Bottoms','Outerwear','Accessories','Footwear','Other'], index: true },
  images: [{ url: String, label: String }],
  description: String,
  price: PriceSchema,
  retailers: [RetailerSchema],   // multi-source; scraper writes here
  tags: [{ type: String, lowercase: true, index: true }],
  score: { type: Number, default: 0 },
  popularity: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  meta: Schema.Types.Mixed
}, { timestamps: true });

ProductSchema.index({ brandId: 1, category: 1, popularity: -1 });
ProductSchema.index({ tags: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);


⸻

2.5 Submission (intake)

Paid/free submission pipeline → review → optionally triggers ScrapeJob.

// backend/models/submissionModel.ts
import mongoose, { Schema } from 'mongoose';

const SubmissionSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['Brand','Designer','BrandDesigner'], required: true },
  tier: { type: String, enum: ['free','paid'], default: 'paid', index: true },
  status: { type: String, enum: ['received','in_review','approved','rejected','scraping','completed'], default: 'received', index: true },
  entity: {
    brandName: String,
    brandWebsite: String,
    brandInstagram: String,
    designerName: String,
    designerWebsite: String,
    designerInstagram: String,
    designerEmail: String,
    category: { type: String, enum: ['High Fashion','Streetwear','Hybrid','Techwear','Workwear','Avant-Garde','Other'] },
    otherCategory: String
  },
  contactEmail: String,
  notes: String,
  paymentRef: String, // if paid
  linkedBrandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
  linkedDesignerId: { type: Schema.Types.ObjectId, ref: 'Designer' }
}, { timestamps: true });

SubmissionSchema.index({ status: 1, tier: 1, createdAt: -1 });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);


⸻

2.6 Vote (Web2) + OnChainReceipt

Web2 votes stored instantly; optionally mirrored on chain (higher weight). This enables MVP voting without waiting for wallets.

// backend/models/voteModel.ts
import mongoose, { Schema } from 'mongoose';

const TargetSchema = new Schema({
  kind: { type: String, enum: ['brand','designer','product'], required: true, index: true },
  id: { type: Schema.Types.ObjectId, required: true, index: true }
}, { _id: false });

const VoteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  anonSessionId: { type: String, index: true }, // for logged-out temp votes; optional
  target: TargetSchema,
  weight: { type: Number, default: 1 }, // Web2 weight; Web3 mirrored adds extra in ranking logic
  source: { type: String, enum: ['web2','web3'], default: 'web2' },
  web3: {
    txHash: String,
    chain: { type: String, enum: ['neon','ethereum'] },
    blockNumber: Number,
    contract: String,
    wallet: String
  }
}, { timestamps: true });

VoteSchema.index({ 'target.kind': 1, 'target.id': 1, createdAt: -1 });
VoteSchema.index({ userId: 1, 'target.kind': 1, 'target.id': 1 }, { unique: true, sparse: true }); 
// one vote per user per target (tune later)

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);

If the on-chain action is a separate flow (recommended), keep a simple mapping:

// backend/models/onChainReceiptModel.ts
import mongoose, { Schema } from 'mongoose';

const OnChainReceiptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  kind: { type: String, enum: ['vote','purchase'], index: true },
  targetKind: { type: String, enum: ['brand','designer','product'], index: true },
  targetId: { type: Schema.Types.ObjectId, index: true },
  chain: { type: String, enum: ['neon','ethereum'], index: true },
  contract: String,
  tokenId: String,   // for NFT receipts
  txHash: { type: String, unique: true, sparse: true },
  blockNumber: Number,
  status: { type: String, enum: ['pending','confirmed','failed'], default: 'pending', index: true },
  meta: Schema.Types.Mixed
}, { timestamps: true });

OnChainReceiptSchema.index({ userId: 1, targetKind: 1, targetId: 1 });

export default mongoose.models.OnChainReceipt || mongoose.model('OnChainReceipt', OnChainReceiptSchema);


⸻

2.7 AffiliateLink

Normalized outbound link used by the frontend “Checkout” flow.

// backend/models/affiliateLinkModel.ts
import mongoose, { Schema } from 'mongoose';

const AffiliateLinkSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  retailer: { type: String, required: true, index: true },     // e.g. ssense
  baseUrl: { type: String, required: true },
  affiliateUrl: { type: String, required: true },
  program: { type: String, enum: ['impact','rakuten','awin','unknown'], default: 'unknown' },
  lastValidatedAt: Date,
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true });

AffiliateLinkSchema.index({ productId: 1, retailer: 1 }, { unique: true });

export default mongoose.models.AffiliateLink || mongoose.model('AffiliateLink', AffiliateLinkSchema);


⸻

2.8 SavedItem / LikedItem

Keep separate collections so we can scale counts independently (and dedupe constraints are cleaner).

// backend/models/savedItemModel.ts
import mongoose, { Schema } from 'mongoose';

const SavedItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetKind: { type: String, enum: ['brand','designer','product'], required: true, index: true },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true }
}, { timestamps: true });

SavedItemSchema.index({ userId: 1, targetKind: 1, targetId: 1 }, { unique: true });

export default mongoose.models.SavedItem || mongoose.model('SavedItem', SavedItemSchema);

// backend/models/likedItemModel.ts
import mongoose, { Schema } from 'mongoose';

const LikedItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetKind: { type: String, enum: ['brand','designer','product'], required: true, index: true },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true }
}, { timestamps: true });

LikedItemSchema.index({ userId: 1, targetKind: 1, targetId: 1 }, { unique: true });

export default mongoose.models.LikedItem || mongoose.model('LikedItem', LikedItemSchema);


⸻

2.9 ScrapeJob / ScrapeResult

Queue-friendly design for Playwright/Cheerio workers.

// backend/models/scrapeJobModel.ts
import mongoose, { Schema } from 'mongoose';

const ScrapeJobSchema = new Schema({
  source: { type: String, enum: ['ssense','farfetch','mrporter','custom'], required: true, index: true },
  kind: { type: String, enum: ['brand','designer','product','collection','listing'], required: true, index: true },
  payload: Schema.Types.Mixed,     // e.g., URL, query, brand slug
  status: { type: String, enum: ['queued','running','success','failed','skipped'], default: 'queued', index: true },
  attempts: { type: Number, default: 0 },
  lastError: String,
  linkedBrandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
  linkedDesignerId: { type: Schema.Types.ObjectId, ref: 'Designer' }
}, { timestamps: true });

ScrapeJobSchema.index({ status: 1, createdAt: 1 });

export default mongoose.models.ScrapeJob || mongoose.model('ScrapeJob', ScrapeJobSchema);

// backend/models/scrapeResultModel.ts
import mongoose, { Schema } from 'mongoose';

const ScrapeResultSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'ScrapeJob', index: true },
  source: { type: String, index: true },
  raw: Schema.Types.Mixed,      // raw HTML/JSON subset if needed (never store huge blobs)
  normalized: Schema.Types.Mixed, // normalized product/brand shape before ingest
  upserts: {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
    designerId: { type: Schema.Types.ObjectId, ref: 'Designer' },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  }
}, { timestamps: true });

export default mongoose.models.ScrapeResult || mongoose.model('ScrapeResult', ScrapeResultSchema);


⸻

2.10 RankingSnapshot

Precomputed leaderboards to power “Popular/Featured/Rankings” without heavy live aggregation.

// backend/models/rankingSnapshotModel.ts
import mongoose, { Schema } from 'mongoose';

const ItemSchema = new Schema({
  kind: { type: String, enum: ['brand','designer','product'], required: true },
  refId: { type: Schema.Types.ObjectId, required: true },
  score: { type: Number, required: true },
  rank: { type: Number, required: true },
  meta: Schema.Types.Mixed
}, { _id: false });

const RankingSnapshotSchema = new Schema({
  scope: { type: String, enum: ['global','category','type'], default: 'global', index: true },
  category: { type: String }, // when scope=category
  period: { type: String, enum: ['daily','weekly','monthly','all'], default: 'daily', index: true },
  items: [ItemSchema],
  computedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export default mongoose.models.RankingSnapshot || mongoose.model('RankingSnapshot', RankingSnapshotSchema);


⸻

2.11 OrderProof (optional MVP+)

Only needed if we actually capture a wallet-signed “receipt” on chain.

// backend/models/orderProofModel.ts
import mongoose, { Schema } from 'mongoose';

const OrderProofSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
  retailer: String,
  orderRef: String, // off-chain order id if partner allows
  nft: {
    chain: { type: String, enum: ['neon'], default: 'neon' },
    contract: String,
    tokenId: String,
    txHash: String
  },
  verifiedAt: Date
}, { timestamps: true });

OrderProofSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.OrderProof || mongoose.model('OrderProof', OrderProofSchema);


⸻

3) Relationships & access patterns
	•	Brand ↔ Designer (optional): Designer.brandId.
	•	Brand/Designer/Product ↔ Vote: Vote.target.
	•	Product ↔ AffiliateLink: 1:N (per retailer).
	•	Submission → Brand/Designer: Linked post-approval + post-scrape.
	•	ScrapeJob → ScrapeResult → Brand/Designer/Product: Record ingest.
	•	User ↔ SavedItem/LikedItem: user collections.
	•	User/Target ↔ OnChainReceipt: mapping to chain transactions.
	•	RankingSnapshot: denormalized top N; recompute hourly/daily.

Common queries & indexes
	•	“Popular Brands” page → Brand.find({ isDeleted:false }).sort({popularity:-1}).limit(…); (index: popularity).
	•	Product details → Product.findOne({ slug }).populate('brandId designerId') (index: slug).
	•	Votes by target → index on target.kind + target.id + createdAt.
	•	Saved items grid → SavedItem.find({ userId }).sort({createdAt:-1}) (+ index).
	•	Retailer scraping updates → Product.updateOne({ _id }, { $set: { retailers.$[x].availability: 'in_stock' } }, { arrayFilters: … }).

⸻

4) Derived fields & ranking logic (MVP)

Compute score nightly (can be more frequent if needed):

for each target in {brand, designer, product}:
  score = (web2_votes * 1) + (web3_votes * 3) + (recent_likes * 0.5)
  popularity = decay(score, half_life=7d)
  write to target.score, target.popularity
  push top N into RankingSnapshot(period='daily')

Cursor should implement a cron/queue worker:
	•	Read Vote (source=web3) as weight 3.
	•	Recent likes = count last 72h.
	•	Decay with exponential or sliding window.

⸻

5) Data validation (API layer)
	•	Use zod or yup for incoming payloads (e.g., submissions, votes).
	•	Enforce one vote per user per item (unique compound index already set).
	•	When anonymous votes are allowed (MVP?), store anonSessionId; later merge when user registers.

⸻

6) Seed data & migrations

Seeders (write to backend/scripts/):
	•	seed-brands.ts (7 types × 5 each)
	•	seed-designers.ts
	•	seed-products.ts (attach to brands/designers)
	•	seed-featured.ts (toggle flags for home)
	•	seed-users.ts (demo user with wallet stub)

Migrations (use a lightweight runner like migrate-mongo or custom):
	•	Add slug fields if missing; backfill with slugify(name) and ensure uniqueness with suffixes.
	•	Add isDeleted/deletedAt to existing collections.

⸻

7) Example documents (for reference)

Brand

{
  "_id": "65f1...",
  "name": "Brand One",
  "slug": "brand-one",
  "type": "High Fashion",
  "headquarters": { "city": "Tokyo", "country": "Japan" },
  "website": "https://brandone.com",
  "images": [{ "url": "/placeholders/brand-1.jpg", "label": "hero" }],
  "score": 42,
  "popularity": 33.5,
  "isFeatured": true
}

Product

{
  "_id": "65f2...",
  "brandId": "65f1...",
  "name": "Panelled Wool Jacket",
  "slug": "panelled-wool-jacket",
  "category": "Outerwear",
  "images": [{ "url": "/placeholders/product-1.jpg", "label": "front" }],
  "price": { "currency": "USD", "current": 1290, "original": 1490, "lastSeenAt": "2025-03-03T09:00:00Z" },
  "retailers": [
    {
      "name": "SSENSE",
      "productUrl": "https://ssense.com/...",
      "affiliateUrl": "https://go.impact.com/…",
      "source": "ssense",
      "availability": "in_stock",
      "lastCheckedAt": "2025-03-03T09:00:00Z"
    }
  ],
  "tags": ["avant-garde","fw25"],
  "score": 11,
  "popularity": 9.2
}

Vote

{
  "_id": "65f3...",
  "userId": "65e9...",
  "target": { "kind": "brand", "id": "65f1..." },
  "weight": 1,
  "source": "web2",
  "createdAt": "2025-03-03T10:00:00Z"
}


⸻

8) Security & integrity notes (model level)
	•	Sparse unique on emails/usernames to avoid conflicts when users sign up later.
	•	Write fences: Use Mongoose versionKey (default __v) to avoid overwriting concurrent updates to retailers arrays.
	•	PII: Keep minimal; do not store OAuth secrets. Payment refs on Submission are non-sensitive identifiers.
	•	Anti-spam: Rate limit votes & saves at API level; keep indexes here for enforcement queries.
	•	On-chain data: Never trust client-provided txHash—verify via RPC before marking confirmed.

⸻

9) What Cursor must do (Agent checklist)
	1.	Analyze current backend models. If any of these files already exist (brandModel.js etc.), generate DECISIONS/ADR-xxxx-models-reconciliation.md summarizing:
	•	What exists, what’s missing.
	•	Proposed non-breaking augmentations.
	•	Index additions.
	•	Migration steps.
	2.	Create/augment models exactly as above (TypeScript preferred; if JS repo, keep JS but add JSDoc types).
	3.	Add indexes with Model.createIndexes() on server boot and/or a scripts/apply-indexes.ts.
	4.	Write seeders under backend/scripts/ and add npm scripts:

"scripts": {
  "db:seed": "ts-node backend/scripts/seed-all.ts",
  "db:indexes": "ts-node backend/scripts/apply-indexes.ts"
}


	5.	Add basic factories for e2e testing (Faker).
	6.	Backfill slugs for existing Brand/Designer/Product; ensure unique.

Acceptance criteria (Gate - Models):
	•	All schemas exist and compile.
	•	Indexes created without errors.
	•	Seeders run; home/featured pages can render with seeded content.
	•	ADR created if repo already had overlapping models.

⸻

10) Frontend compatibility (important)
	•	The existing UI uses slugs and category/type labels like “Streetwear,” “High Fashion,” etc. The models above preserve those strings for drop-in compatibility.
	•	Ensure Featured/Popular queries are supported via isFeatured, popularity, and RankingSnapshot.
	•	Keep placeholder images and labels until scraper fills real data.

⸻

11) Future extensions (do not implement now)
	•	Collections/Lookbooks entity to group products by season.
	•	Location indexing (GeoJSON) for map visualizations. For MVP, store city/country strings; later, add location: { type: 'Point', coordinates: [lng, lat] } + 2dsphere index.
	•	Comments/Reviews with moderation.
	•	Multi-chain support via chain registry collection.

⸻

12) Quick FAQ (for the owner)
	•	Can I change field names later? Yes, but it will require a migration; safer to add new fields and deprecate old ones.
	•	Do I need all models for MVP? Minimum: User, Brand, Product, Vote, Submission, ScrapeJob, AffiliateLink.
	•	Where does Web3 show up? Vote.source=web3 + OnChainReceipt mapping. Phase 1 can store tx hash after wallet flow.

⸻

13) Example import barrel

Create an index to simplify imports:

// backend/models/index.ts
export { default as User } from './userModel';
export { default as Brand } from './brandModel';
export { default as Designer } from './designerModel';
export { default as Product } from './productModel';
export { default as Submission } from './submissionModel';
export { default as Vote } from './voteModel';
export { default as OnChainReceipt } from './onChainReceiptModel';
export { default as AffiliateLink } from './affiliateLinkModel';
export { default as SavedItem } from './savedItemModel';
export { default as LikedItem } from './likedItemModel';
export { default as ScrapeJob } from './scrapeJobModel';
export { default as ScrapeResult } from './scrapeResultModel';
export { default as RankingSnapshot } from './rankingSnapshotModel';
export { default as OrderProof } from './orderProofModel';


⸻

14) Done-when (what success looks like)
	•	Backend boots, applies indexes.
	•	Seed script populates ~50 brands, ~50 products, and a few designers.
	•	Frontend collection pages render seeded data with correct slugs and labels.
	•	Submissions can be created (paid/free), status updates recorded.
	•	Votes persist and dedupe by user+target.
	•	A daily RankingSnapshot exists with top 20 of each kind.
	•	Outbound checkout uses AffiliateLink if present; otherwise uses retailers[].productUrl.

⸻

Appendices

A. Field dictionary keywords
	•	score — numerical aggregate used for ranking (votes + engagement).
	•	popularity — time-decayed score for “Trending/Popular”.
	•	source — origin of data (manual vs scraped).
	•	slug — URL-friendly unique name.

B. Slug rules
	•	slug = slugify(name).toLowerCase(), replace non-alphanumerics with -, collapse dashes, trim.
	•	On conflict, append -2, -3, etc.

C. Category vocab (keep consistent with UI)
	•	Brand/Designer types: Streetwear | High Fashion | Avant Garde | Hybrid | Techwear | Workwear | Other
	•	Product categories: Tops | Bottoms | Outerwear | Accessories | Footwear | Other

⸻

Agent next step

After saving this file, Cursor must:

	1.	Scan backend/models/ (there are stubs like brandModel.js) and generate an ADR proposing non-breaking augmentation.
	2.	Implement/augment the schemas above.
	3.	Add seeders + index scripts.
	4.	Run a local sanity test: create one Brand/Product/Vote via a script and confirm counts + indexes.
	5.	Post a summary at /docs/SCOPE_AND_PHASES.md and wait for approval (APPROVE: Gate Models).

⸻
