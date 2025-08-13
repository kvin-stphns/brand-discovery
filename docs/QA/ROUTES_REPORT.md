Route Crawl Report (UI Gate 1)

Date: 2025-08-12

This report enumerates key navigation/mega menu routes, their current destination paths, and observed results based on Next.js build output and local dev behavior.

Top-level pages

- HOME → `/` → OK
- DISCOVER → `/discover` → OK
- EXPLORE (intended) → `/explore` → MISSING (Not implemented yet)
- RANKINGS → `/rankings` → OK
- FAQ → `/faq` → OK
- FEATURED → `/featured` → OK
- POPULAR → `/popular` → OK
- ABOUT → `/about` → OK
- CONTACT → `/contact` → OK
- PRIVACY → `/privacy` → OK
- LOGIN → `/login` → OK
- SIGNUP → `/signup` → OK
- LIKED → `/liked` → OK
- SAVED → `/saved` → OK
- SUBMISSIONS → `/submissions` → OK

Detail pages (dynamic)

- Brand detail → `/brand/[id]` (example: `/brand/brand-1`) → OK (dynamic)
- Designer detail → `/designer/[id]` (example: `/designer/designer-1`) → OK (dynamic)
- Product detail → `/product/[id]` (example: `/product/product-1`) → OK (dynamic)

Discover + Category routes (via MegaMenu/MobileMenu)

- WOMEN → Discover → View All → `/women/discover/view-all` → OK
- WOMEN → Discover → Spotlight → `/women/discover/spotlight` → OK
- WOMEN → Discover → Trending → `/women/discover/trending` → OK
- WOMEN → Discover → Lookbooks → `/women/discover/lookbooks` → OK
- WOMEN → Discover → Location → CURRENT: `/women/discover/location` → OK (renders list)
  - Intended: `/discover/map` (single map view)

- MEN → Discover → Location → CURRENT: `/men/discover/location` → OK (renders list)
  - Intended: `/discover/map`

- EXPLORE (top-level) → any submenu link under Discover/Brands/Categories/etc → CURRENT: all resolve to `/discover` due to mapping → NOT AS INTENDED
  - Intended: EXPLORE → `/explore`; EXPLORE → Discover → Spotlight → `/explore/discover/spotlight` (dynamic list)

Map

- Map page → `/discover/map` → OK
- Menu link path → CURRENT: MegaMenu/MobileMenu link "Location" points to `/[category]/discover/location` → OK but not the map view.
  - Intended: Link → `/discover/map` (unified map)

HTTP/Server notes

- Frontend build: OK (no errors). Lint shows warnings only.
- Backend server on port 3001: no routes defined; any request other than root will return 404. This is expected at this stage.

Known issues captured

1) EXPLORE mapping points to `/discover` instead of `/explore` and ignores submenu link choices.
2) Discover → Location menu items route to `/{category}/discover/location` instead of `/discover/map`.
3) Cart icon in navbar has no click handler; no cart store/drawer wired; Product page "ADD TO CART" has no action.
4) Some placeholder image sources can exceed available variants (e.g., `brand-5.jpg` to `brand-8.jpg`), causing 404s.


