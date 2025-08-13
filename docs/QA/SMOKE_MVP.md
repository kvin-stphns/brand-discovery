# MVP Smoke Checklist

1. Backend start
- cd backend && npm start
- GET http://localhost:3001/healthz → 200 { ok:true }

2. Seed and scrape
- npm run seed
- npm run scrape:ssense
- npm run scrape:farfetch
- GET /api/admin/data-status → counts { brands, designers, products, votes, clicks }

3. Frontend start
- cd ../frontend && NEXT_PUBLIC_API_ENDPOINT=http://localhost:3001 NEXT_PUBLIC_USE_LIVE_API=true npm run dev
- Home renders; Featured/Popular load live if available
- Product page loads live by id

4. Checkout
- On a product page, click Checkout → opens affiliate URL in new tab

5. Search
- Use navbar search; results appear; clicking navigates to brand/designer/product pages

6. Rankings
- Visit /rankings and category subpages; ensure live data or empty states when none

7. Smoke script
- cd .. && npm run check:mvp