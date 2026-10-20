# Reputia

SaaS italiano per gestire le recensioni Google con risposte assistite dall'intelligenza artificiale.

> Stato: in sviluppo. Non inserire dati reali di clienti finché autenticazione e isolamento dei dati non sono verificati (vedi `docs/AUDIT.md`).

## Stack
Next.js 16 (App Router) · React 19 · TypeScript strict · PostgreSQL 16 · Prisma 7 · Docker / Coolify

## Sviluppo locale
```bash
cp .env.example .env            # imposta DATABASE_URL
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
| `npm run build` | Genera il client Prisma e la build di produzione |
| `npm run db:migrate` | Crea/applica migrazioni in sviluppo |
| `npm run db:deploy` | Applica le migrazioni in produzione |

## Stack completo in Docker
```bash
POSTGRES_PASSWORD=test APP_URL=http://localhost:3000 \
  docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Deploy: vedi `DEPLOY-COOLIFY.md`.
