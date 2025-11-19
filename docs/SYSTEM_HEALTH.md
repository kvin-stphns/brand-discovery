# System Health Report

## The Missing Link
The frontend displays "Live data unavailable" because the database is empty.
**Root Cause:** The project is running with `npm run start:mem`, which spins up an isolated **in-memory MongoDB**.
- The scraping script (`npm run scrape:all`) runs in a **separate process**.
- When the scraper runs, it cannot connect to the server's private in-memory database. It likely connects to a default local instance or creates its own temporary one, meaning the server never sees the data.

## The Manual Fix
To populate data immediately, we must ensure the server and scraper share a database.
1.  **Stop** the current `npm run start:mem` process.
2.  **Run** `npm run start` (connects to local persistent MongoDB at `mongodb://127.0.0.1:27017/brand_discovery`).
3.  **Run** `npm run scrape:all` in a separate terminal.

*Note: If you must use in-memory mode, we cannot use the CLI scraper. We must trigger the scrape via the API (Phase 3).*

## UI/Logic Risks
- **`frontend/app/featured/page.tsx`**: Handles missing data safely with `prods?.length`.
- **`frontend/app/(shop)/product/[id]/page.tsx`**: Needs verification to ensure it handles a `null` product gracefully (often causes 404 or crash if `product.title` is accessed without checking).
- **Recommendation**: Ensure all data access uses optional chaining (`?.`) or fallback values.

## Automation Plan
We will implement a "Scrape-if-Empty" mechanism:
1.  **Backend**: Create `POST /api/scrape` that runs the scraping logic *inside* the server process. This allows it to write to the in-memory database.
2.  **Frontend**: If the homepage data fetch returns empty, call `/api/scrape` (with a limit of ~5 items for speed), show a "Initializing Demo Data..." skeleton, and then refresh.
