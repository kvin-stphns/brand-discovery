# Hosting

## Frontend (Vercel)
- Import repo into Vercel
- Set Environment Variables:
  - NEXT_PUBLIC_API_ENDPOINT: your backend URL (e.g., https://api.example.com)
- Build Command: npm run build
- Output: .next

## Backend (Render/Heroku)
- Use Dockerfile or Node build
- Set Environment Variables:
  - PORT
  - MONGODB_URI
  - JWT_SECRET
  - NEON_RPC_URL (optional)
  - WEB3_PRIVATE_KEY (optional)
  - SSENSE_AFF_ID (optional)
  - FARFETCH_AFF_ID (optional)
- Start Command: npm start

## Verification
- Backend: GET /healthz returns { ok: true }
- Frontend: Home, Featured, Popular, Product, Rankings load with live data when available