# Stato del progetto — 20 ottobre 2026

## Staging online
- **https://reputia.websardegna.xyz** (Coolify, progetto «Reputia», app `npnzodpfmvevrt2gkyvh8ajn`, branch `dev`), certificato Let's Encrypt, DNS A su Spaceship → 13.140.190.190.
- Variabili impostate: segreti generati, `APP_URL`, `LEGAL_COMPANY_NAME`/`PRODUCT_OF_*` = WebSardegna. SMTP attivo (Resend). Mancano AI, Google, Stripe.
- Il deploy non parte da solo al push (repo pubblico senza webhook): ridistribuire da Coolify o via API.

## Funziona ed è verificato
| Area | Verifica |
|------|----------|
| Build riproducibile (lockfile, Next 16, Prisma 7, Node 24) | `npm run build`, `docker compose up --build` |
| Migrazioni automatiche, health check con DB ed email | Stack completo in Docker, 503 con DB spento |
| Registrazione, verifica email, login, reset password | Browser + API; login negato senza verifica |
| Rate limiting auth (5 login/min) | 429 al sesto tentativo in produzione |
| Organizzazioni, ruoli, inviti | Codice + test; inviti non provati con SMTP reale |
| Isolamento tra organizzazioni | Test di integrazione su Postgres + prova manuale con due utenti (404 / 403) |
| Onboarding in 3 passi, dashboard, inbox, editor risposta | Browser end-to-end |
| Controlli di sicurezza sulle bozze (sconti, rimborsi, ammissioni, contatti) | Unit test + browser |
| Pubblicazione solo dopo conferma esplicita di un admin, con audit log | Browser + DB |
| Webhook Stripe: firma, idempotenza, retry | Richieste firmate in locale |
| Sito pubblico, prezzi, contatti con consenso GDPR, pagine legali | Browser |
| Backup giornaliero del database | Container `backup`, primo dump creato |

## Simulato (dichiarato come tale nell'interfaccia)
- **Google Business Profile**: approvato e verificato contro Google (vedi tabella). Resta non provata solo la **pubblicazione di una risposta reale** su una recensione: non è stata fatta per non scrivere in pubblico sui profili del titolare. La modalità simulazione resta disponibile, carica 12 recensioni di esempio e non invia nulla a Google.
- **AI senza chiave**: in sviluppo, senza `ANTHROPIC_API_KEY`, le bozze sono testi di esempio marcati «Bozza di sviluppo». In produzione senza chiave la generazione restituisce un errore esplicito. **La chiamata reale a Claude non è stata eseguita** (nessuna chiave su questa macchina).

## Non ancora completo
| Blocco | Cosa serve |
|--------|------------|
| Email transazionali | **Configurate (21/10/2026)**: Resend, regione UE (eu-west-1), mittente `noreply@reputia.websardegna.xyz`, DKIM/SPF/DMARC su Spaceship, chiave «sending only» limitata al dominio. Tracking dei clic non attivo (link non riscritti). |
| Google | **Approvato, configurato e verificato contro Google (26/10/2026)**: progetto Cloud `reputia-512221` n. 937045868547, `mybusiness.googleapis.com` (v4, recensioni) abilitata insieme alle API v1. Client OAuth web «Reputia Web», app **In production**, scope `business.manage` non sensibile. Prova reale: consenso OAuth completato, refresh token ottenuto, `GET /v1/accounts` → 1 account, `/v1/{account}/locations` → 3 sedi, `v4/{account}/{location}/reviews` → 5 recensioni; sync end-to-end su Postgres locale: **59 recensioni importate** (paginazione inclusa), risposte già presenti su Google importate come `PUBLISHED`, secondo giro incrementale `created: 0, updated: 0`, token rinnovato automaticamente e collegamento ancora `ACTIVE`. `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`CRON_SECRET` impostati in Coolify (staging) e nel `.env` locale. |
| Stripe | Sandbox, prezzo, webhook; registrazione IVA in Stripe Tax; **fatturazione elettronica SDI** |
| Pagine legali | Dati societari (`LEGAL_*`) e revisione da parte di un professionista |
| Sincronizzazione automatica | Endpoint `POST /api/cron/sync` implementato e con segreto `CRON_SECRET` impostato su staging: sedi Google attive non archiviate, massimo tre sync concorrenti, isolamento degli errori. Manca solo la pianificazione della chiamata sul server (cron di Coolify o cron esterno, vedi `DEPLOY-COOLIFY.md` §4). |
| Notifiche | Email al titolare per nuove recensioni negative |
| Monitoraggio errori | Sentry o equivalente (oggi solo log del container) |
| Eliminazione account / export dati GDPR | Oggi su richiesta via email |
| Test E2E automatici | Oggi unit + integrazione (25 test); l'E2E è stato fatto a mano nel browser |
