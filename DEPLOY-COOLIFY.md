# Deploy di Reputia su Coolify

> Solo **staging** finché autenticazione e isolamento dei dati non sono verificati in produzione.
> Non toccare le altre applicazioni sul server (WebSardegna, Rakazo, ecc.).

## Architettura
`docker-compose.yml` definisce tre servizi:

| Servizio | Ruolo |
|----------|-------|
| `db` | PostgreSQL 16 con volume persistente `reputia_postgres`. Solo rete interna. |
| `migrate` | Esegue `prisma migrate deploy` e termina. `web` parte solo se va a buon fine. |
| `web` | Next.js standalone (`node server.js`), utente non root, porta interna 3000. |

Nessuna porta viene pubblicata sull'host: il dominio passa dal proxy di Coolify.

## Creazione della risorsa
1. Coolify → **Project → New Resource → Git Repository (GitHub App)** → `raunchy1/reputia`.
2. Build pack: **Docker Compose**, file `/docker-compose.yml`, branch `dev` per lo staging (`main` per la produzione).
3. Variabili d'ambiente (in Coolify, mai nel repository):
   - `POSTGRES_PASSWORD` — generata: `openssl rand -base64 32`
   - `POSTGRES_USER=reputia`, `POSTGRES_DB=reputia`
   - `APP_URL=https://<dominio>` senza slash finale
4. Dominio: assegnalo **solo** al servizio `web`, porta `3000`. Nessun dominio su `db` e `migrate`.
5. Deploy. Verifica:
   - `https://<dominio>/api/health` → `{"status":"ok","database":"ok"}`
   - il container `migrate` termina con exit code 0.

## Rollback
- Applicazione: in Coolify ridistribuisci il commit precedente (Deployments → Redeploy).
- Le migrazioni Prisma non hanno un rollback automatico: ogni migrazione deve essere additiva
  (nuove colonne nullable o con default). Le modifiche distruttive vanno divise in più rilasci.

## Backup
Prima dei clienti reali, attiva i backup schedulati del database in Coolify
(o un `pg_dump` giornaliero su storage esterno) e prova almeno un ripristino.

## Problemi comuni
| Sintomo | Causa probabile |
|---------|-----------------|
| Build fallisce su `npm ci` | `package-lock.json` non allineato a `package.json`. |
| `web` non parte | `migrate` fallito: guarda i suoi log. |
| 502 | Dominio non associato a `web:3000`, o health check fallito. |
| Health `503 degraded` | Database non raggiungibile o `POSTGRES_PASSWORD` cambiata dopo la creazione del volume. |
