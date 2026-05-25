# UI / UX Spec

## Visual Rules

- Preserve the existing visual identity, nav, mega menu, typography rhythm, borders, spacing language, and global layout unless a stability issue requires a scoped fix.
- Do not casually redesign `frontend/components/layout/Navbar.tsx`, `MegaMenu.tsx`, `MobileMenu.tsx`, or global styles.
- Keep page fixes scoped to broken components and data states.
- Product cards should look complete in test mode and never rely on obvious placeholders.
- Use the existing black/white/editorial visual system and cyan accent where already established.

## Page Inventory

- `/`: home, featuring hero, featured products, popular module, and rankings.
- `/featured`: featured product grid.
- `/popular`: popular product grid.
- `/explore`: mixed product grid plus rankings module.
- `/discover`: discovery hub.
- `/product/:id`: product detail.
- `/rankings`: global rankings.
- `/:category/rankings`: category rankings.
- `/:category/rankings/most-liked`: most liked view.
- `/:category/rankings/most-viewed`: most viewed view.
- `/:category/rankings/recently-liked`: recent likes view.
- `/:category/rankings/location`: ranking location/map view.
- `/discover/map`: location map page.
- `/brand/:id`: brand detail.
- `/designer/:id`: designer detail.
- `/submissions`: submission form.
- `/saved`, `/liked`: user empty states.
- `/about`, `/contact`, `/faq`, `/privacy`, `/terms`: content pages.

## Product Card Requirements

Every product card should show:

- Product image from `images[0]`.
- Brand.
- Title.
- Formatted price.
- Link to `/product/:id`.

If data is unavailable:

- Loading state: skeleton or intentionally blank loading layout.
- Empty state: explicit no-results message with no placeholder product pretending to be real.
- Error state: concise retry/unavailable message.

## Product Detail Requirements

Product detail should show:

- Breadcrumb.
- Image gallery.
- Brand and title.
- Formatted current price and optional original price.
- Size selector only when sizes exist.
- Availability.
- Description.
- Details.
- Shipping and returns.
- Add to cart.
- Affiliate checkout CTA.
- Accessible icon button labels.

## Cart Requirements

- Empty state: clear, minimal message.
- Item rows: image, brand, title, size, quantity, formatted price.
- One item checkout: direct affiliate checkout CTA.
- Multiple items: group by retailer/source and show individual checkout CTAs because checkout occurs on retailer sites.
- Remove and clear actions should be keyboard accessible.

## Rankings Requirements

- DB-backed rows only.
- Product rows should route to `/product/:id`.
- Score should come from click count, vote count, recency, and quality score.
- Empty state should explain that rankings populate when products/clicks/votes exist.
- No frontend generated mock rows in MVP.

## Accessibility Requirements

- Meaningful `alt` text for product images.
- Icon-only buttons must have `aria-label`.
- Select controls must have labels.
- Mode toggles should expose `aria-pressed`.
- Dialogs should use `role="dialog"` and `aria-modal`.
- Loading/error states should be visible text, not only toasts.
- Text should not overlap or overflow card/control boundaries.

## What Not To Alter

- Global nav/mega menu styling unless explicitly approved.
- Global typography scale unless fixing a concrete overflow/accessibility bug.
- Hero/global layout composition unless app stability requires it.
- Visual identity colors unless correcting contrast in a scoped component.

