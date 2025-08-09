
⸻

/docs/FRONTEND/UI_TASKS.md

Audience note (very important): The project owner is a novice developer. Cursor’s Agent Mode must do all implementation autonomously, preserve the existing structure, and only add/fix unless a bug requires refactor. The Agent should continuously analyze the repo and document changes in /docs/CHANGELOG.md.

0) Goals & Guardrails

Goals
	•	Ship a beautiful, cohesive, Balenciaga-esque grid UI (minimal, avant-garde accents).
	•	Keep the UI bug-free, fully responsive, and consistent across all pages/components.
	•	Prepare all current static content to be data-ready (easy to swap to dynamic API later).
	•	Implement voting, interactive map, and data visualizations scaffolds to enable the MVP loop.

Guardrails
	•	Augment, don’t rewrite. Keep current components/pages; refactor only when necessary to fix defects or enable reuse.
	•	One design system. Normalize tokens, spacing, typography, and component variants.
	•	Routing parity. Don’t change routes unless incorrect; if corrected, add redirects and note in CHANGELOG.
	•	DX: Keep file names, imports, and types consistent. Do not create duplicate utilities.

⸻

1) Existing Structure (Baseline)
	•	Layout
	•	frontend/app/layout.tsx — wraps global Navbar + Footer.
	•	frontend/styles/globals.css + tailwind.config.js — tokens and utilities (custom breakpoints, brand colors).
	•	Nav & Menus
	•	components/layout/Navbar.tsx — Top-level nav (desktop/tablet/mobile).
	•	components/layout/MegaMenu.tsx — Desktop layered mega menu.
	•	components/layout/MobileMenu.tsx — Mobile 3-layer menu.
	•	components/layout/ScrollableNav.tsx — Tablet horizontal scroller.
	•	Templates
	•	components/templates/CategoryGrid.tsx — Grid page template.
	•	components/templates/ListLayout.tsx — List + preview split layout.
	•	components/templates/ContentPage.tsx — Static content layout.
	•	components/templates/GridLayout.tsx — Generic grid wrapper.
	•	Homepage
	•	pages/index.tsx — Uses Navbar, Hero, FeaturedBrands, PopularBrands, Footer.
	•	components/Hero.tsx, components/FeaturedBrands.tsx, components/PopularBrands.tsx
	•	Core Pages (app dir)
	•	Auth: (auth)/login, (auth)/signup
	•	Product: (shop)/product/[id]
	•	Entities: /brand/[id], /designer/[id]
	•	Aggregation: /discover, /featured, /popular
	•	Category routes: /[category]/[section]/[subsection], /[category]/[section]/view-all
	•	User: (user)/liked, (user)/saved
	•	Static: /about, /contact, /faq, /privacy
	•	Types & Utils
	•	types/gridItems.ts, types/locations.ts, types/placeholders.ts
	•	lib/utils.{ts,js}, components/ui/button.js

Agent: Use this as source of truth for where to extend.

⸻

2) Global UI Tasks (Apply Everywhere)
	1.	Design System Unification
	•	Create /frontend/styles/design-tokens.css (CSS vars) or Tailwind theme extension for:
	•	Colors (--brand-black, --accent-cyan:#4FFFF4, neutrals)
	•	Spacing scale, radii, z-index, shadows
	•	Typography scale & tracking utilities (e.g., .track-025 → tracking-[0.25em])
	•	Replace one-off magic numbers with tokens/utilities.
	2.	Typography & Rhythm
	•	Standardize headings (h1/h2/h3), body, captions.
	•	Normalize letter-spacing usages (many are [0.25em] — keep, but make tokens/utilities).
	3.	Responsive Consistency
	•	Ensure all top spacings account for the fixed header.
	•	Confirm breakpoints: mobile: 428px, tablet: 649px, desktop: 1149px.
	•	Add container max widths consistently (max-w-[2000px] mx-auto px-8 pattern).
	4.	Loading & Error States
	•	Add skeletons for grids, list previews, product images.
	•	Add inline error banners for network failures (even if data is static now).
	•	Provide empty states for liked, saved.
	5.	Accessibility
	•	Add semantic headings order, aria-expanded for menus, focus outlines, skip-to-content.
	•	Keyboard nav for mega menu and mobile menu.
	•	Alt text for images (fallback from item names).
	6.	SEO/OG
	•	Add per-page <title> & <meta> scaffolds via Next Metadata in app routes.
	•	OG tags via metadata or route segments.
	7.	Analytics Hooks (no vendor lock)
	•	Add a tiny event util: lib/analytics.ts with no-op methods (later wired to real provider).
	•	Instrument: nav clicks, filter changes, product impressions, CTA clicks, affiliate redirects.

⸻

3) Navigation & Menu Fixes

Files: Navbar.tsx, MegaMenu.tsx, MobileMenu.tsx, ScrollableNav.tsx

Tasks
	•	Normalize link generation so Layer-2 links match actual routes:
	•	/[category]/discover/*
	•	/[category]/brands/*
	•	/[category]/categories/*
	•	/[category]/designers/*
	•	/[category]/rankings/*
	•	Extract shared link builders to lib/nav.ts:

export function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g,'-') }
export function hrefFor(section:'discover'|'brands'|'categories'|'designers'|'rankings', category:string, link:string) {
  const slug = toSlug(link)
  const base = `/${toSlug(category)}/${section}`
  return slug === 'view-all' ? `${base}/view-all` : `${base}/${slug}`
}


	•	Keyboard/Focus: Add role="menu", aria-controls, proper Menu.Item focus traps.
	•	Close-on-route: After navigating from any menu, ensure menu state resets.
	•	Add a “sticky divider” fix so borders don’t clip under overlays on scroll.

Acceptance
	•	All menu items route to valid pages (no 404).
	•	Tab/Shift+Tab cycles items correctly.
	•	Mobile 3-tier nav animates and resets reliably.

⸻

4) Grid & List Templates (Data-Ready)

Files: CategoryGrid.tsx, ListLayout.tsx, GridLayout.tsx, ContentPage.tsx

Tasks
	•	Convert all templates to accept strong typed props (export interfaces).
	•	Add loading and error props to show skeleton or error state (for future data).
	•	Replace hard-coded strings with derived labels via helper functions in types/gridItems.ts.
	•	Create components/common/Skeleton.tsx (grid card, list item, hero image).
	•	Add components/common/EmptyState.tsx (message + CTA).

Acceptance
	•	Templates render with placeholder data now and can switch to fetched data later without markup changes.
	•	aria-busy and skeletons appear during suspense (we’ll wire Suspense later).

⸻

5) Homepage Polish

Files: pages/index.tsx, components/Hero.tsx, components/FeaturedBrands.tsx, components/PopularBrands.tsx, components/Footer.tsx

Tasks
	• Hero
		• Parallax guard: pending
	• Featured/Popular
		• Image paths validated and placeholder usage consistent (done – 2025-08-09)
	• Footer
		• Links audit: pending

Acceptance
	•	Smooth scroll & parallax; no layout shift.
	•	Grid cards align perfectly across breakpoints.

⸻

6) Core Pages Completion

6.1 Featured & Popular

Files: app/featured/page.tsx, app/popular/page.tsx
	•	Already implemented. Add loading/error states and analytics event on page load.

6.2 Brand & Designer

Files: app/brand/[id]/page.tsx, app/designer/[id]/page.tsx
	•	Add “View Products/Collections” routing (stub routes if needed).
	•	Add like/save button handlers (stubbed to local state now; future API later).
	•	Add share button scaffold.

Acceptance
	•	Pages render responsive image gallery, metadata, and actions.
	•	Buttons do not throw errors and can be wired to APIs later.

6.3 Product

File: app/(shop)/product/[id]/page.tsx
	•	Ensure breadcrumb matches actual route with segment params.
	•	Add size dropdown validation and disabled Add to Cart when no size.
	•	Add Buy on Brand CTA (currently links to placeholder; later replaced by affiliate redirect).
	•	Add zoom overlay or lightbox (optional, progressive enhancement).

Acceptance
	•	No console errors on interactions.
	•	Mobile “Add to Cart” sticky action doesn’t overlap content.

6.4 User: Liked & Saved

Files: app/(user)/liked/page.tsx, app/(user)/saved/page.tsx
	•	Add filters (All / Brands / Designers / Products) with local state.
	•	Show empty state with CTA to browse when arrays are empty.
	•	Prepare for pagination (client-side for now).

Acceptance
	•	Filter toggles work without reload.
	•	Empty and loading states are present.

6.5 Static Pages

Files: app/about/page.tsx, app/contact/page.tsx, app/faq/page.tsx, app/privacy/page.tsx
	•	Contact form: client validation + mock submit → toast.
	•	FAQ: add anchor links per question (ids).
	•	Privacy: add “Last updated” metadata field at top.

Acceptance
	•	No broken links; forms provide feedback.

⸻

7) Rankings, Voting, Data Viz (Phase 1 UI)

New/Updated Files
	•	components/vote/VoteButton.tsx
	•	components/vote/VotePanel.tsx (for inline explanation, cooldown timers)
	•	components/viz/RankSpark.tsx (tiny sparkline using <svg>)
	•	app/[category]/rankings/view-all/page.tsx (uses ListLayout)
	•	app/leaderboard/page.tsx (Phase 2 visual leaderboard)

Tasks
	•	Build VoteButton with three states: idle, pending, confirmed. For now, simulate success with timeout; later wire to API/Web3.
	•	RankSpark: render static mock data now. API-ready prop signature: data: number[].
	•	Rankings pages: use CategoryGrid for mixed; ListLayout for “View All”.

Acceptance
	•	Voting interactions feel responsive (optimistic UI with rollback path).
	•	Svelte-like micro-animations kept subtle; respect reduced-motion.

⸻

8) Interactive Map (Phase 1 UI)

New Files
	•	components/map/GeoMap.tsx (client component)

Tasks
	•	Use a progressive enhancement approach:
	•	Phase 1: Render a stylized SVG world map or a minimal Canvas with hotspots (no heavy libs to start).
	•	Plot a few location pins from types/locations.ts.
	•	On hover/click: show tooltip or side panel listing brands/designers from that location (placeholder data now).
	•	Provide a clean API so we can swap to a heavier lib later if needed.

Acceptance
	•	Map loads quickly.
	•	Works on mobile (tap = tooltip).

⸻

9) Routing, Slugs, and 404s

Tasks
	• Added app/not-found.tsx (done – 2025-08-09)
	• Slug helpers: pending
	• Route validation report: pending

Acceptance
	•	No broken routes from any menu path.
	•	Invalid paths show not-found.

⸻

10) Performance Pass

Tasks
	•	next/image everywhere (already used; verify fill vs sizes usage).
	•	Preload hero and first fold images only; lazy load rest.
	•	Audit bundle size: remove duplicate utils (utils.js vs utils.ts), ensure single cn export.
	•	Memoize large lists when static (React.memo or key strategies).

Acceptance
	•	Lighthouse (desktop): Performance ≥ 90, Best Practices ≥ 95, A11y ≥ 90.

⸻

11) Developer Experience & Consistency

Tasks
	•	Add ESLint + Prettier configs (basic) if missing; auto-fix on commit.
	•	Add scripts:

"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint --fix",
  "typecheck": "tsc --noEmit"
}


	•	Ensure single source cn helper (lib/utils.ts). Deprecate lib/utils.js.
	•	Add README snippet for running frontend quickly.

Acceptance
	•	pnpm|npm run lint is clean.
	•	No duplicate helper functions or dead files.

⸻

12) Visual QA Checklist (Agent must run)
	•	Borders align at all grid edges, no double borders.
	•	All hover/focus states consistent (opacity/underline rules).
	•	Menus: no z-index overlaps; open/close transitions smooth.
	•	Breadcrumbs: correct on product/brand/designer routes.
	•	Typography scale is consistent across pages.
	•	Mobile: no horizontal scroll bleed.
	•	Dark backgrounds (Popular section) maintain contrast and readability.
	•	Parallax disabled on prefers-reduced-motion.

Agent logs issues + fixes in /docs/CHANGELOG.md.

⸻

13) Acceptance Criteria by Page/Module
	•	Navbar/Menus: 100% routes valid, keyboard accessible, no stuck-open states.
	•	CategoryGrid/ListLayout: Skeletons + error states, props typed, data-ready.
	•	Home (Hero/Featured/Popular): Smooth parallax, no CLS; analytics events fired.
	•	Brand/Designer/Product: Actions (like/save) stubbed; clean metadata sections; responsive gallery.
	•	Liked/Saved: Filters function, empty states present.
	•	Static pages: Contact validates and “submits”; FAQ anchors; Privacy metadata.
	•	Rankings/Vote/Data Viz: Voting optimistic UX; sparks render; accessible labels.
	•	Map: Lightweight, responsive tooltips; modular API.
	•	404: Friendly not-found page exists.
	•	Perf/A11y: Lighthouse thresholds met.

⸻

14) Implementation Order (Agent)
	1.	Global tokens & utilities
	2.	Nav & menus routing fix + a11y
	3.	Templates (grid/list) data-ready pass
	4.	Homepage polish
	5.	Core entities (brand/designer/product)
	6.	User pages (liked/saved)
	7.	Static pages polish
	8.	Rankings + Vote + Viz scaffold
	9.	Interactive Map (Phase 1)
	10.	Routing/404 + Slugs
	11.	Performance & a11y pass
	12.	DX cleanup & analytics hooks

At the end of each block, write a summary into /docs/SCOPE_AND_PHASES.md and await approval (Gate 1 is UI completion).

⸻

15) Files to Add (Agent creates)
	•	frontend/components/common/Skeleton.tsx
	•	frontend/components/common/EmptyState.tsx
	•	frontend/components/vote/VoteButton.tsx
	•	frontend/components/vote/VotePanel.tsx
	•	frontend/components/viz/RankSpark.tsx
	•	frontend/components/map/GeoMap.tsx
	•	frontend/app/not-found.tsx
	•	frontend/lib/nav.ts
	•	frontend/lib/slug.ts
	•	frontend/lib/analytics.ts
	•	frontend/styles/design-tokens.css (optional if not using Tailwind tokens)

⸻

16) Notes for Future Data Wiring
	•	The templates should expect data objects shaped like upcoming API responses defined in /docs/BACKEND/API_SPEC.md.
	•	Keep labels derived using helpers in types/gridItems.ts.
	•	Use SWR or React Query later; for now keep props static or use useEffect mock fetches.

⸻

17) Agent Self-Checks (must run)
	•	Validate all routes by crawling Navbar, MegaMenu, MobileMenu link arrays and attempting fetch() HEAD requests to each path in dev mode.
	•	Run Lighthouse via next build && next start (manual step if CI not yet set).
	•	Run an automated a11y audit (axe-core script) in dev against top pages and output a small report to /docs/QA/REPORTS/ui-a11y-quickcheck.md.

⸻

18) Done = Gate 1

When all Acceptance Criteria above pass, update /docs/SCOPE_AND_PHASES.md → mark Gate 1 completed and request human approval with a short, bullet summary of changes and screenshots (or list of tested pages).

⸻
