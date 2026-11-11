# CeoPoonD

## Deploy on Vercel

This repository is configured as one Vercel project with two services: the Vite frontend and the Express API. The frontend is served at `/`; requests under `/api/` are routed to the backend.

1. Import `Kamin888/CeoPoonD` from GitHub in Vercel and keep the project root at the repository root.
2. Add these environment variables to the Vercel project for Production and Preview as needed:
   - `DATABASE_URL`: the PostgreSQL connection string from Neon.
   - `JWT_SECRET`: a random secret of at least 32 characters.
   - `ADMIN_EMAILS`: comma-separated administrator email addresses.
3. Deploy. The frontend uses same-origin `/api` URLs, so no `VITE_API_URL` is needed on Vercel.

For local Vercel routing, install the Vercel CLI and run `vercel dev` from the repository root. For the regular Vite dev server, `/api` is proxied to `http://localhost:3000` by `frontend/vite.config.js`.

The API is public under `/api` because the browser calls it directly through the project's public rewrites. The backend does not need a service binding: bindings are for server-side service-to-service calls, and this app has none.
