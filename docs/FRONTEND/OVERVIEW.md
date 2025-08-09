
⸻

FRONTEND / OVERVIEW

Audience note (owner skill level): The project owner is a novice developer. Cursor’s Agent must work autonomously, analyze the repository continuously, optimize/fix code, and pause only at approval gates in /docs/SCOPE_AND_PHASES.md.

Agent directives (read-first):
	•	Augment, don’t rewrite. Preserve existing structure, styles, and routes unless an ADR is approved.
	•	Continuously scan the repo and fill “(Agent-filled)” sections.
	•	If you change structure or decisions, append to /docs/CHANGELOG.md and draft ADRs in /docs/DECISIONS/*.

⸻

1) Goals
	•	Finish the UI quickly with a beautiful, cohesive, on-brand experience:
	•	Swedish grid / Balenciaga-inspired layout: stark grids, generous whitespace, precise typography.
	•	Minimal, avant-garde flourishes where strategic (interactive map, data-driven rankings, micro-interactions).
	•	Eliminate inconsistencies (routing, spacing, breakpoints, duplicated utils).
	•	Replace placeholders with typed DTOs + mock API adapters so backend can plug in without breaking the UI.
	•	Ship a revenue-ready MVP: Featured/Popular, brand/designer/product pages, submissions, login/signup, liked/saved, rankings (with voting), affiliate checkout redirect.

⸻

2) Current Route Inventory (Agent-filled)

Agent: Inspect /frontend/app and list every route, what it displays, and any obvious issues (layout shifts, hardcoded labels, broken links, inconsistent headers). Include any legacy /pages usage and whether it should be consolidated.

	•	App Router Routes:
	•	/ (Home): Hero, Featured, Popular, Navbar, Footer — Status: (Agent-filled)
	•	/discover …
	•	/(auth)/login, /(auth)/signup …
	•	/brand/[id], /designer/[id], /product/[id] …
	•	/[category]/[section]/[subsection], /[category]/[section]/view-all …
	•	Footer pages: /about, /contact, /faq, /privacy …
	•	Legacy /pages present? (Agent-filled)
	•	Open issues: (Agent-filled list: spacing, sticky headers offsets, duplicate utilities, inconsistent breakpoints, etc.)

Commit after filling:
	•	docs/CHANGELOG.md: “Frontend route inventory documented.”

⸻

3) Component & Template Taxonomy

Keep, refine, and centralize:
	•	Layout
	•	Navbar, MegaMenu, MobileMenu, ScrollableNav, Footer, RootLayout
	•	Rules:
	•	One source of truth for menu taxonomies (Discover/Brands/Categories/Designers/Rankings) in components/layout/config.ts (Agent to create).
	•	Standardize header heights & sticky offsets; move magic numbers to a shared token file.
	•	Templates
	•	CategoryGrid (grid galleries), ListLayout (split list/preview), ContentPage (fixed header + content), CollectionGrid
	•	Rules:
	•	All list/grid items must accept a typed item DTO (see Section 6).
	•	Move link building, labeling logic into lib/presenters/* to avoid duplication across templates.
	•	UI
	•	Button (shadcn variant system), Icons (lucide)
	•	Rules:
	•	Normalize Button variants (ghost, link, solid, outline) and sizes (sm, md, lg).
	•	Centralize CTA styles used in Hero, cards, and map modals.

⸻

4) Design Language & Branding
	•	Typography: Inter; tracking variants ~0.05–0.25em; headings bold/condensed feel; body neutral.
	•	Color: Black/white core; accent #4FFFF4 (teal) for “Popular”, selections, on-hover borders, data viz highlights.
	•	Grid: Crisp borders (1px), full-bleed section dividers, asymmetric negative space on luxury surfaces.
	•	Motion: Short, assertive transitions (150–250ms), avoid bouncing; parallax used sparingly (Hero/Popular ok).
	•	Breakpoints: Tailwind custom (mobile: 428px, tablet: 649px, desktop: 1149px). Ensure consistent usage.

Agent action: Create /frontend/styles/tokens.css or lib/theme/tokens.ts that exports: header heights, z-index layers, spacings, radii, border widths, transition durations, accent colors. Refactor components to consume tokens.

⸻

5) Advanced UI Features (Must-have)

5.1 Interactive Map (Locations Discovery)
	•	Where: /discover and /rankings/locations (new), linkable from MegaMenu → Discover → Location.
	•	Behavior:
	•	World/region map (pick library: Mapbox GL JS or react-simple-maps for MVP).
	•	Hover/Click region → modal sheet with Top Brands/Designers in that location (grid of 8–12).
	•	Filters: Category (Streetwear/High Fashion/…); Type (Brand/Designer/Product).
	•	Animated pan/zoom, lightweight tooltips.
	•	Data: Use mock API adapters (Section 7) to feed 8–20 items; real data later.
	•	Performance: Debounce hover; prefetch thumbnails via next/image.

5.2 Rankings Data Visualization
	•	Where: /rankings and /rankings/leaderboard (new pages).
	•	Components:
	•	Bar/Column charts for Top 10 brands/designers (library: Recharts for speed).
	•	Sparkline for trend over the last 7/30 days (mini chart on cards).
	•	Vote heatmap (optional Phase 2).
	•	Behavior:
	•	Quick filter chips (time window, type).
	•	Click bar → navigate to entity page; card shows rank, score, delta (↑/↓).
	•	Design: Neutral palette with accent highlights; thin gridlines; labels with tracking.

5.3 Voting UI (Hybrid Web2/Web3)
	•	Inline controls on cards/pages (Heart, Bookmark, Vote).
	•	States: default → hover (accent border) → active (filled/colored).
	•	Flow: If wallet connected + verified → on-chain vote path available; else do Web2 vote (Mongo) with CTA to “Boost your vote by verifying wallet”.
	•	Feedback: Subtle toast + optimistic UI update; reconcile after API response.

⸻

6) Typed Item DTOs & Presenters

Replace ad-hoc item shapes with stable DTOs. The agent must add a shared types module.

// /frontend/types/dto.ts
export type BaseEntityDTO = {
  id: string
  name: string
  image: string
  href: string
  label?: string
  meta?: Record<string, string | number>
}

export type BrandDTO = BaseEntityDTO & {
  kind: 'brand'
  category: 'High Fashion' | 'Streetwear' | 'Hybrid' | 'Techwear' | 'Workwear' | 'Avant Garde' | 'Other'
  location?: string
}

export type DesignerDTO = BaseEntityDTO & {
  kind: 'designer'
  category?: string
}

export type ProductDTO = BaseEntityDTO & {
  kind: 'product'
  price?: number
  currency?: string
  brandName?: string
}

export type GridItemDTO = BrandDTO | DesignerDTO | ProductDTO

Presenter helpers (to unify label creation / links):

// /frontend/lib/presenters/items.ts
export const itemHref = (item: GridItemDTO) => item.href
export const itemLabel = (item: GridItemDTO) => item.label ?? ''

Agent: Refactor CategoryGrid, PopularBrands, FeaturedBrands, and dynamic pages to consume GridItemDTO. Keep current UI but remove duplicated label/slug logic.

⸻

7) Mock API Adapters (Swap-in for real API later)

Goal: FE can ship now. When BE is ready, swap adapters with minimal changes.

// /frontend/lib/api/client.ts
const API = process.env.NEXT_PUBLIC_API_ENDPOINT
export const get = (path: string, init?: RequestInit) => fetch(`${API}${path}`, { ...init, cache: 'no-store' })
export const post = (path: string, body: unknown, init?: RequestInit) =>
  fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...init })

// /frontend/lib/api/mock.ts (MVP)
import { GridItemDTO } from '@/types/dto'
export const mockList = async (kind: 'brand'|'designer'|'product', n=20): Promise<GridItemDTO[]> => {
  // generate consistent placeholder DTOs
  // …(Agent implement)
  return []
}

Agent: Wire page data to mockList() initially. Add a FEATURE_FLAG_USE_MOCKS=true env in frontend; if false, use client.ts.

⸻

8) Routing & Navigation Rules
	•	Keep existing MegaMenu structure; centralize link building in components/layout/linking.ts.
	•	All bottom links (Login, Liked, Saved, Submissions, About) must route to real pages (some exist; fill missing).
	•	Breadcrumbs: Use a single shared Breadcrumbs component; compute from router segments.

⸻

9) Page-by-Page Tasks & Acceptance

Agent: Use this as a checklist. Record completion in /docs/FRONTEND/UI_TASKS.md.

9.1 Home (/)
	•	Tasks:
	•	Verify Hero parallax is smooth (no layout shift on header).
	•	Ensure Featured/Popular sections link correctly.
	•	Add “Explore by Location” CTA to map page.
	•	Acceptance: Lighthouse ≥ 90 perf; no console errors; responsive at all breakpoints.

9.2 Discover (/discover)
	•	Tasks: Replace random link grid with Discover hub (cards: Spotlight, Trending, Lookbooks, Location, Random) — each routes into existing [category]/[section]/[subsection] pages, plus the Map page.
	•	Acceptance: Cards keyboard-navigable; hover states consistent; skeletons for loading.

9.3 Featured (/featured) & Popular (/popular)
	•	Tasks: Refactor to GridItemDTO; ensure 8–12 items; add filter chips (All/Brands/Designers/Products).
	•	Acceptance: Filters switch instantly (client-side); cards have consistent labels.

9.4 Brand (/brand/[id]) & Designer (/designer/[id])
	•	Tasks: Clean sticky layout; unify “View all products/collections” CTA; inject voting and save controls (disabled until API).
	•	Acceptance: No overflow; thumbnails highlight active; mobile sticky buy bar hidden here.

9.5 Product (/product/[id])
	•	Tasks: Size selector, image gallery, price, Add to cart/Buy → affiliate redirect (stub for now).
	•	Acceptance: Mobile buy bar works; on click we call a stub that logs “affiliate redirect”—to be replaced by backend.

9.6 Rankings (/rankings, /rankings/leaderboard)
	•	Tasks: Build data viz components (Recharts) and cards with rank/score/delta; Leaderboard grid with big tiles.
	•	Acceptance: Charts render with mock data; clicking rows navigates to entity pages.

9.7 Map (/discover/map or /rankings/locations)
	•	Tasks: Integrate map lib; region selection opens modal grid; “View all in region” links to filtered rankings page.
	•	Acceptance: Smooth pan/zoom; keyboard accessible fallback list view.

9.8 Account
	•	Login/Signup: Wire wallet connect buttons (UI only for now).
	•	Liked/Saved: Use DTO cards; 4–8 columns responsive grid.
	•	Acceptance: No flashes on navigation; filters work; empty states designed.

9.9 Content Pages
	•	About/Contact/FAQ/Privacy: Already present; ensure consistent header offsets, line lengths, and spacing.

⸻

10) UI Consistency Audit (Agent-run)
	1.	Breakpoints: Replace any raw media queries with Tailwind mobile/tablet/desktop utilities.
	2.	Spacing: Normalize header offsets (mt-[155px], etc.) into a token --header-offset and reuse.
	3.	Borders & Dividers: Use 1px black; no double borders at grid joins; ensure full-bleed top dividers per section.
	4.	Duplicate Utils: Merge lib/utils.ts + lib/utils.js into a single TS module.
	5.	Images: Use next/image everywhere; configure next.config.js image domains safely (no **).
	6.	Labeling/Linking: Extract to lib/presenters/items.ts and components/layout/linking.ts.
	7.	ARIA/A11y: Menu buttons have proper roles, focus traps for mega menu layers, ESC to close, tab order sane.
	8.	Skeletons/Loaders: Add uniform skeletons for grids, lists, and detail pages.
	9.	Toasts/Errors: Add simple toast hook; standard error banners for API failures.

Output: Write findings + fixes to /docs/FRONTEND/OPTIMIZATIONS.md. Update CHANGELOG.md.

⸻

11) State, Data & Feature Flags
	•	State: Use React state/hooks + server components where appropriate; avoid heavy client state libs for MVP.
	•	Data: Fetch via adapters; no direct BE URLs in components.
	•	Flags: NEXT_PUBLIC_FEATURE_FLAG_USE_MOCKS, NEXT_PUBLIC_SHOW_MAP, NEXT_PUBLIC_SHOW_VIZ.

⸻

12) Accessibility & SEO
	•	Proper h1/h2 order; alt text; focus outlines; skip-to-content link.
	•	OG tags via app/layout.tsx metadata; canonical URLs; robots.txt & sitemap (add later in Deploy).

⸻

13) Performance Targets
	•	Lighthouse: ≥ 90 on Performance/Best Practices/SEO on Home, Featured, and Brand pages.
	•	Avoid layout thrashing in parallax; requestAnimationFrame already used — keep it minimal on mobile.

⸻

14) Telemetry (MVP)
	•	Console logging fallback; instrument user events (vote, save, affiliate_click) with a thin lib/analytics.ts.
	•	Later swap to a real provider (Plausible/PostHog).

⸻

15) Deliverables & Approval
	•	Deliverables:
	•	DTO refactor; presenters; mock data adapters; interactive map; rankings charts; unified routing; consistency audit fixes; skeletons and toasts.
	•	Docs updates:
	•	/docs/FRONTEND/UI_TASKS.md checklist kept current.
	•	/docs/FRONTEND/OPTIMIZATIONS.md details issues + resolutions.
	•	/docs/CHANGELOG.md entries per change.
	•	Gate: “Gate 1 – UI completed” in /docs/SCOPE_AND_PHASES.md requires:
	•	All pages routable, consistent, and typed; map + rankings viz shipped with mocks; acceptance criteria met.

⸻

16) Nice-to-Have (Phase 2+)
	•	Global Command-K search (brands/designers/products).
	•	“Stories” style lookbook viewer (auto-advance, keyboard nav).
	•	Animated micro-interactions (hover borders that trace the card edges).

⸻

Commit & Next Steps
	1.	Agent: Populate Section 2 (route inventory) and run the UI Consistency Audit (Section 10).
	2.	Implement DTOs/presenters & mock adapters; refactor grids/lists to consume them.
	3.	Build Map and Rankings viz pages with mock data.
	4.	Update /docs/FRONTEND/UI_TASKS.md, /docs/FRONTEND/OPTIMIZATIONS.md, and /docs/CHANGELOG.md.
	5.	Pause at Gate 1 for approval (respond with summary & screenshots).

⸻
