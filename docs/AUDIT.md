# Audit iniziale — 20 ottobre 2026

Stato del repository al commit `5f1f6c6`, prima degli interventi della Fase 1.

## Architettura trovata

- Next.js 15.5 (App Router), React 19, TypeScript strict, CSS custom in `app/globals.css`.
- Una sola pagina client (`app/page.tsx`, una riga minificata) con 3 recensioni finte e risposte predefinite.
- Prisma 6 con schema `Organization/User/Membership/Location/Review`, **mai usato** dal codice e senza migrazioni.
- API `/api/generate`, `/api/reviews`, `/api/settings` bloccate da `lib/demo-guard.ts` (403 in produzione).
- Docker a stadio unico + Compose con Postgres 16.

Baseline verificata: `npm install`, `tsc --noEmit`, `next build` e `docker compose build` passavano; `/api/health` rispondeva `ok` senza controllare il database.

## Problemi per gravità

### Critici (bloccano un deploy affidabile)
| # | Problema | Stato |
|---|----------|-------|
| C1 | Nessun `package-lock.json`: build non riproducibili (range `^`). | Risolto |
| C2 | `npm audit`: 4 high + 1 moderate (postcss in Next < 16.3, deepmerge-ts in Prisma ≤ 7.10.0). | Risolto (0 vulnerabilità) |
| C3 | Dockerfile: Node 20 (fine supporto), processo root, devDependencies nell'immagine, `next start` con output standalone. | Risolto |
| C4 | Compose pubblicava la porta 3000 sull'host: conflitti con altre app sul VPS e bypass del proxy Coolify. Nessun healthcheck per `web`. | Risolto |
| C5 | Nessuna migrazione: il database non veniva mai creato. | Risolto |

### Alti
| # | Problema | Stato |
|---|----------|-------|
| H1 | Nessuna autenticazione né isolamento tra organizzazioni. | Fase 3 |
| H2 | `/api/generate` inviava JSON dell'utente all'LLM senza rate limit, senza tracciamento costi; difesa da prompt injection solo nel prompt. | Rimosso, riscritto in Fase 5 |
| H3 | `/api/health` non verificava il database. | Risolto |
| H4 | Nessun header di sicurezza; `X-Powered-By` esposto. | Risolto |

### Medi
- `app/page.tsx` illeggibile (una riga), tutto client-side, `alert()`, label non associate agli input.
- Schema Prisma: stati come stringhe libere, nessun `onDelete`, nessun `updatedAt`.
- `tsconfig`: `allowJs`, target ES2017.
- Nessun test.

## Interventi della Fase 1
- Stack aggiornato: Next 16.4.2, React 19.3.1, Prisma 7.10.1 (driver adapter `pg`), Zod 4, versioni esatte + lockfile.
- `prisma.config.ts`, client generato in `lib/generated/prisma` (non versionato), `lib/db.ts` con connessione lazy.
- Migrazione iniziale `prisma/migrations/*_init`.
- Dockerfile multi-stage su Node 24: `deps` → `builder` → `migrator` → `runner` (utente non root, `node server.js`, HEALTHCHECK).
- Compose: servizio `migrate` one-shot prima di `web`, nessuna porta sull'host, `docker-compose.local.yml` per i test locali.
- Health check con `SELECT 1`: `200 ok` oppure `503 degraded`.
- Header di sicurezza in `next.config.ts`.
