/docs/FRONTEND/OPTIMIZATIONS.md

Mode: Augment-not-rewrite · Audience: Cursor Agent (primary), project owner (novice)
Goal: Make the existing UI fast, consistent, accessible, and brand-cohesive while preserving current layouts and routes. Add subtle, avant-garde interactions where they add value (maps, voting, rankings viz), not everywhere.

⸻

0) Read Me First (Agent)
	•	Analyze the repo (entire frontend/) and generate a delta plan instead of a rewrite.
	•	Record every structural change in /docs/CHANGELOG.md.
	•	If a decision changes a prior assumption, create a new ADR file under /docs/DECISIONS/ and reference it in the changelog.
	•	Follow the Gates in /docs/SCOPE_AND_PHASES.md. Request approval before leaving each Gate.

⸻

1) Brand System & Design Tokens (Tailwind)

Intent: Lock a consistent visual language (Swedish grid / Balenciaga-inspired minimalism), so new pages stay cohesive.

1.1 Tokenize brand decisions
	•	Keep existing Tailwind config but centralize tokens:
	•	Colors already defined in tailwind.config.js + :root CSS vars. Normalize names:
	•	brand.bg → --background
	•	brand.fg → --foreground
	•	brand.border → --border
	•	Accent (neon cyan): --accent: #4FFFF4 (already used in Popular section).
	•	Add semantic utility classes:

@layer utilities {
  .accent { color: var(--accent); }
  .accent-border { border-color: color-mix(in oklab, var(--accent) 60%, black); }
  .accent-bg { background-color: color-mix(in oklab, var(--accent) 10%, white); }
}



1.2 Type scale & spacing rhythm
	•	Define a type ramp in docs (Agent to codify as Tailwind plugin or CSS vars):
xs: 10px, sm: 12px, base: 14px, lg: 16px, xl: 20px, 2xl: 24px.
	•	Line-height: 1.15–1.4 depending on component.
	•	Spacing baseline: multiples of 4px.
	•	Enforce tracking rules used in the UI (e.g., [0.25em]) via utilities:

@layer utilities {
  .trk-tight { letter-spacing: 0.05em; }
  .trk-mid   { letter-spacing: 0.15em; }
  .trk-wide  { letter-spacing: 0.25em; }
}



Action (Agent): Search for inline [tracking-*] classes and replace with the utilities above (mechanical change, no visual shift).

⸻

2) Layout Consistency & Routing Integrity

Intent: Preserve the current structure; fix mismatches and edge cases so the app scales.

2.1 App Router vs Pages Router
	•	You are using Next 13 app directory and legacy pages/.
	•	Short-term MVP rule: keep pages/ only for the root home route (if needed), otherwise migrate index to /app and remove duplication to avoid hydration warnings.
	•	Move /frontend/pages/index.tsx into /frontend/app/page.tsx if safe.
	•	Ensure _app.tsx global styles are applied via /app/layout.tsx (already present).
	•	If migration performed, add ADR: ADR-0003-next-app-router-migration.md.

2.2 Stable navigation & links
	•	Verify all menu/mega menu links map to actual routes:
	•	/[category]/[section]/[subsection] (grid)
	•	/[category]/[section]/view-all (list)
	•	/brand/[id], /designer/[id], /product/[id]
	•	Footer & bottom links: /login, /liked, /saved, /submissions, /about, /contact, /faq, /privacy
	•	Action (Agent): Run a route crawler (Node script) against next dev to detect 404s. Emit a report in /docs/QA/ROUTES_REPORT.md.

⸻

3) Performance Pass (Core Web Vitals)

Intent: Keep the UI image-heavy but fast.

3.1 Next/Image hygiene
	•	Replace any raw <img> with <Image> (already mostly done).
	•	Ensure sizes hints on hero and large grids:

<Image fill priority sizes="(min-width:1149px) 25vw, (min-width:649px) 33vw, 50vw" .../>


	•	Defer non-critical images: loading="lazy", drop priority except for above-the-fold.

3.2 Parallax & scroll handlers
	•	Current requestAnimationFrame use is good; throttle observers:
	•	Use a single shared scroll listener per page.
	•	Guard with if (!isInViewport) early return.
	•	Disable parallax on low-end devices (feature detect prefers-reduced-motion):

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduced) return // disable parallax



3.3 CSS & JS budget
	•	Remove unused CSS modules if superseded by Tailwind.
	•	Tree-shake icon sets: import specific lucide-react icons (already done).
	•	Code-split heavy sections (interactive map, data viz, wallet UI) with next/dynamic:

const RankingsViz = dynamic(() => import('@/components/analytics/RankingsViz'), { ssr:false })



3.4 Linting & formatting
	•	Add and enforce:
	•	eslint-config-next + @typescript-eslint
	•	eslint-plugin-tailwindcss for class ordering
	•	prettier + prettier-plugin-tailwindcss
	•	Action (Agent): Create /frontend/.eslintrc.cjs and /frontend/.prettierrc and fix all autofixable issues. Write summary to CHANGELOG.

⸻

4) Accessibility (A11y) & Keyboard Support

Intent: Minimalist ≠ inaccessible.
	•	Landmarks: Ensure header, main, footer exist per page.
	•	Focus management: MobileMenu & MegaMenu must trap focus when open and restore on close.
	•	ARIA labels: Add aria-label to icon-only buttons (heart, bookmark, bag, menu).
	•	Reduced motion: Respect prefers-reduced-motion for all transitions/parallax.
	•	Contrast: Validate #4FFFF4 on dark backgrounds; add 2px focus ring on interactive elements.

Action (Agent): Add @axe-core/react dev-only to flag violations during next dev. Output /docs/QA/A11Y_REPORT.md.

⸻

5) Data Model Scaffolding in UI (Future-proof for API)

Intent: Replace hardcoded placeholder strings with typed view models so swapping to live API won’t break pages.

5.1 Types

Create /frontend/types/view.ts:

export type EntityType = 'product' | 'brand' | 'designer'
export type GridItemVM = {
  id: string
  type: EntityType
  name: string
  image: string
  label?: string
  brand?: string
  designer?: string
  category?: string
  price?: number
  // tracking
  liked?: boolean
  saved?: boolean
}
export type BreadcrumbVM = { label: string; href?: string }[]

5.2 Mappers

Create /frontend/lib/mappers.ts to convert raw API → GridItemVM.
Refactor CategoryGrid, ListLayout, FeaturedBrands, PopularBrands to consume GridItemVM (only prop typing changes; keep visuals).

⸻

6) Avant-Garde Interactions (Minimal, Purposeful)

Intent: Strategic polish, not gimmicks.

6.1 Motion language
	•	Defaults: 150–250ms, ease-[cubic-bezier(0.33,1,0.68,1)] for entrances; ease-out for hover.
	•	Micro-interactions:
	•	Hover reveal of labels (already present) → add slight scale 1.01 and letter-spacing interpolation.
	•	Button press → opacity 0.85 + 1px translateY.
	•	Reduced motion: Animate opacity/blur only.

6.2 Rankings Data Visualization
	•	Component: /components/analytics/RankingsViz.tsx (lazy-loaded).
	•	Start with Recharts (already allowed) for bar/radar; use accent highlights on top ranks.
	•	Provide aria-desc summary of chart for screen readers.

6.3 Interactive Map (Locations)
	•	Component: /components/locations/Map.tsx loaded only on pages that need it.
	•	Use MapLibre GL (open-source) with a minimal tile style; plot brand/designer counts by city.
	•	Hover → neon outline pulse on pins; click → slide-in mini card with “Top brand/designer in this city”.

Action (Agent): Implement components skeletons with mocked data first. Wire later to API.

⸻

7) Menu System Hardening

Intent: The MegaMenu/MobileMenu are core. Make them robust.
	•	Close on route change: Ensure router.events or usePathname() change closes menus.
	•	Pointer & keyboard: Up/Down to move; Esc to close; Enter to navigate.
	•	Z-index sanity: Header (1001+), overlays (1000+), content below.
	•	Mobile slide layers: Ensure translate classes don’t clash with fixed borders; add will-change only when open.

⸻

8) Error States, Empty States, Skeletons

Intent: MVP polish perceived quality.
	•	Add consistent Loading skeletons (/components/skeletons/GridCard.tsx, /components/skeletons/ListRow.tsx).
	•	Error components: /components/states/ErrorBoundary.tsx, /components/states/EmptyState.tsx.
	•	Use Next’s error.js and loading.js per route where useful.

⸻

9) Test Plan (UI)

Intent: Protect against regressions while iterating fast.
	•	Unit: Component render snapshots via @testing-library/react.
	•	Accessibility: jest-axe on key pages (Home, CategoryGrid, Product, Brand, Designer).
	•	E2E (critical paths):
	1.	Navigate menu → grid page.
	2.	Open product, change image, select size.
	3.	Like/save actions (local mocked state).
	•	Agent: Add /frontend/tests/** and a GitHub Action job to run on PR.

⸻

10) Concrete Changes & Snippets

10.1 Focus ring + aria on icon buttons

<button aria-label="Save" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/80 rounded">
  <Bookmark className="w-5 h-5" />
</button>

10.2 Reduced motion guard (shared util)

/frontend/lib/motion.ts

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

Use in parallax hooks.

10.3 Dynamic import for heavy modules

import dynamic from 'next/dynamic'
export const Map = dynamic(() => import('@/components/locations/Map'), { ssr:false })


⸻

11) Acceptance Criteria (Gate 1 – “UI Complete”)
	•	✅ All routes navigable; no 404s for documented links (see route report).
	•	✅ Lint passes, no TypeScript errors, Tailwind class ordering consistent.
	•	✅ A11y report shows no critical issues; focus management correct for menus.
	•	✅ Performance: hero + grids provide sizes; parallax guarded by reduced-motion; no layout shifts on main pages.
	•	✅ Visual cohesion: shared tokens/utilities applied; tracking utilities in place; headings match type ramp.
	•	✅ Skeletons/error states present for grids & detail pages.
	•	✅ Mocked RankingsViz and Map components integrated and lazy-loaded.
	•	✅ CHANGELOG.md documents all updates; ADR added if App Router migration was performed.

⸻

12) Step-by-Step Task List (Agent)
	1.	Audit & Plan
	•	Run repo scan; produce /docs/QA/ROUTES_REPORT.md, /docs/QA/A11Y_REPORT.md (initial).
	•	Draft change plan; append to CHANGELOG.md.
	2.	Tokens & Utilities
	•	Add tracking utilities; sweep components to use them.
	•	Confirm color vars; add .accent, .accent-border, .accent-bg.
	3.	Performance
	•	Update <Image> sizes; remove unnecessary priority.
	•	Add dynamic imports to heavy components (create stubs for Map/RankingsViz).
	4.	A11y
	•	Add aria-label & focus rings to icon buttons.
	•	Trap focus in MobileMenu/MegaMenu; restore focus on close.
	•	Respect reduced motion across parallax and animations.
	5.	Data View Models
	•	Add types/view.ts and lib/mappers.ts.
	•	Update CategoryGrid, ListLayout, FeaturedBrands, PopularBrands props minimally.
	6.	Skeletons & States
	•	Add skeleton and error/empty components; wire into grid/detail pages.
	7.	Testing & Reports
	•	Add minimal tests; run and export results.
	•	Update A11y & Routes reports post-changes.
	8.	Gate 1 Review
	•	Summarize changes in /docs/SCOPE_AND_PHASES.md → await approval.

⸻

13) Notes for the Project Owner (plain English)
	•	We’re not redesigning—we’re polishing and stabilizing what you have.
	•	The “avant-garde” feel will show up in rankings visuals, map pins, hover/press subtleties, and clean motion—not distracting animations.
	•	After this pass, swapping in live API data will be safe because the UI now uses typed view models instead of hardcoded strings.

⸻

14) Handover to Backend/Web3 Phases
	•	Once Gate 1 is approved, the Agent will bind the UI to the API contracts in /docs/BACKEND/API_SPEC.md.
	•	Map & Rankings components then get real data.
	•	Wallet connect + voting surfaces will reuse the same patterns (lazy-loaded, accessible, tokenized).

⸻

End of file