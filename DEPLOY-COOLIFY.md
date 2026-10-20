# Deploy Reputia on Coolify (demo only)

## Prerequisites
- Coolify instance connected to GitHub repository `raunchy1/reputia`
- A free subdomain or a domain pointed to the Coolify server
- Do not enter production customer data: authentication and tenant isolation are not implemented.

## Deploy
1. In Coolify, create **Project → New Resource → Git Repository → Docker Compose**.
2. Select repository `raunchy1/reputia`, branch `main`, Compose file `/docker-compose.yml`.
3. Set environment variables:
   - `POSTGRES_PASSWORD`: generate a strong unique password (never commit it).
   - `POSTGRES_USER=reputia`
   - `POSTGRES_DB=reputia`
   - `APP_PORT=3000` (change if host port is already in use)
   - `DEMO_API_ENABLED=false`
   - Leave `OPENAI_API_KEY` empty for the demo.
4. Assign a public HTTPS domain to **web** service on internal port **3000**. Keep **db** private.
5. Deploy and check `https://YOUR_DOMAIN/api/health`; it should return JSON with `status: ok`.
6. Open the domain and check the dashboard navigation, demo review replies, and mobile layout.

## Important limitations
- Demo replies in the UI are static examples; no actual Google API or OpenAI API requests are made by the UI.
- Production API routes `/api/generate`, `/api/reviews`, and `/api/settings` are intentionally blocked.
- No real customer signup, billing, Google OAuth, or multi-tenant data isolation yet.
- A PostgreSQL service is included for later phases; the demo dashboard does not use it.
- Database schema migrations and backups must be configured before production customer onboarding.

## Troubleshooting
- Build failure: inspect the Coolify build log; verify that `prisma/schema.prisma` exists on branch `main`.
- 502: ensure domain routes to web service internal port 3000 and app is healthy.
- Database unhealthy: confirm `POSTGRES_PASSWORD` is set.
- Never expose port 5432 publicly.
