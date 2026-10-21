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
- **Google Business Profile**: il provider reale è implementato secondo la documentazione ufficiale (OAuth, refresh token, sync paginata, pubblicazione), ma **non è stato provato contro Google** perché serve un progetto GBP approvato. Nel frattempo la modalità simulazione carica 12 recensioni di esempio e non invia nulla a Google.
- **AI senza chiave**: in sviluppo, senza `ANTHROPIC_API_KEY`, le bozze sono testi di esempio marcati «Bozza di sviluppo». In produzione senza chiave la generazione restituisce un errore esplicito. **La chiamata reale a Claude non è stata eseguita** (nessuna chiave su questa macchina).

## Non ancora completo
| Blocco | Cosa serve |
|--------|------------|
| Email transazionali | **Configurate (21/10/2026)**: Resend, regione UE (eu-west-1), mittente `noreply@reputia.websardegna.xyz`, DKIM/SPF/DMARC su Spaceship, chiave «sending only» limitata al dominio. Tracking dei clic non attivo (link non riscritti). |
| Google | Richiesta di accesso API inviata il 20/10/2026 (caso **6-9644000042113**, progetto Cloud `reputia-512221` n. 937045868547, profilo WebSardegna). Attesa 7–10 giorni lavorativi. Poi: abilitare `mybusiness.googleapis.com` (v4), schermata di consenso OAuth e verifica dello scope `business.manage` |
| Stripe | Sandbox, prezzo, webhook; registrazione IVA in Stripe Tax; **fatturazione elettronica SDI** |
| Pagine legali | Dati societari (`LEGAL_*`) e revisione da parte di un professionista |
| Sincronizzazione automatica | Oggi la sync è manuale (pulsante) o al collegamento. Serve un job pianificato |
| Notifiche | Email al titolare per nuove recensioni negative |
| Monitoraggio errori | Sentry o equivalente (oggi solo log del container) |
| Eliminazione account / export dati GDPR | Oggi su richiesta via email |
| Test E2E automatici | Oggi unit + integrazione (25 test); l'E2E è stato fatto a mano nel browser |
