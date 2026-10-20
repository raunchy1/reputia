# Reputia

SaaS italiano per gestire le recensioni Google con risposte assistite dall'intelligenza artificiale.

> Stato: pronto per lo staging. Cosa funziona, cosa è simulato e cosa manca: `docs/STATUS.md`. Audit iniziale: `docs/AUDIT.md`.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · PostgreSQL 16 · Prisma 7 · Better Auth · Claude (Anthropic) · Stripe · Docker / Coolify

## Sviluppo locale
```bash
cp .env.example .env            # imposta DATABASE_URL, BETTER_AUTH_SECRET, ENCRYPTION_KEY
docker run -d --name reputia-devdb -e POSTGRES_USER=reputia -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=reputia -p 127.0.0.1:5433:5432 postgres:16-alpine
npm ci
npm run db:migrate              # applica le migrazioni e genera il client
npm run dev
```

## Comandi
| Comando | Cosa fa |
|---------|---------|
| `npm run typecheck` | Controllo TypeScript |
| `npm test` | Unit test + test di isolamento tra organizzazioni (usa `DATABASE_URL`) |
| `npm run build` | Genera il client Prisma e la build di produzione |
| `npm run db:migrate` | Crea/applica migrazioni in sviluppo |
| `npm run db:deploy` | Applica le migrazioni in produzione |

## Stack completo in Docker
```bash
POSTGRES_PASSWORD=test APP_URL=http://localhost:3000 \
  docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Deploy: vedi `DEPLOY-COOLIFY.md`.

## Architettura in breve
- `lib/session.ts` — sessione e organizzazione attiva, sempre risolte lato server (`requireOrg`).
- `lib/services/*` — ogni query filtra per `organizationId` dell'utente verificato.
- `lib/reviews/*` — provider recensioni: Google Business Profile reale e simulazione.
- `lib/ai/*` — prompt, generazione con Claude, controlli di sicurezza sulle bozze.
- `lib/billing/*` — Stripe, diritti d'uso (prova / attivo / scaduto).
- Senza SMTP in sviluppo, le email (verifica, reset) vengono stampate nel terminale.
