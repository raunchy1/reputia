# Deploy di Reputia su Coolify

> Prima **staging** (branch `dev`), poi produzione (`main`) solo dopo l'approvazione del titolare.
> Non toccare le altre applicazioni sul server (WebSardegna, Rakazo, ecc.): Reputia usa una
> risorsa Coolify separata, una rete Docker sua e nessuna porta pubblicata sull'host.

## Servizi (`docker-compose.yml`)

| Servizio | Ruolo |
|----------|-------|
| `db` | PostgreSQL 16, volume `reputia_postgres`, solo rete interna |
| `migrate` | `prisma migrate deploy`, poi termina. `web` parte solo se riesce |
| `web` | Next.js standalone, utente non root, porta interna 3000, healthcheck `/api/health` |
| `backup` | `pg_dump` giornaliero compresso in `reputia_backups`, conservato 14 giorni |

## 1. Creare la risorsa
1. Coolify → **New Resource → Git Repository (GitHub App)** → `raunchy1/reputia`.
2. Build pack **Docker Compose**, file `/docker-compose.yml`, branch `dev` (staging).
3. Dominio **solo** su `web`, porta `3000` (es. `https://staging.reputia.<dominio>`). Nessun dominio su `db`, `migrate`, `backup`.

## 2. Variabili d'ambiente (in Coolify, mai nel repository)

Obbligatorie:

| Variabile | Come generarla |
|-----------|----------------|
| `POSTGRES_PASSWORD` | `openssl rand -hex 24` |
| `APP_URL` | URL pubblico, senza slash finale |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 48` |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` — **non cambiarla mai** dopo il primo collegamento Google (i token salvati diventerebbero illeggibili) |
| `SMTP_URL`, `EMAIL_FROM` | Provider email transazionale (es. `smtps://utente:password@smtp.provider.it:465`). Senza, le registrazioni restano sospese |

Funzionalità (vuote = disattivate, l'app lo segnala in modo chiaro):

| Variabile | Effetto |
|-----------|---------|
| `ANTHROPIC_API_KEY`, `AI_MODEL` | Generazione delle bozze. Senza chiave in produzione la generazione restituisce un errore esplicito |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Collegamento Google Business Profile (vedi §4). Senza, è disponibile solo la simulazione |
| `STRIPE_*` | Abbonamenti (vedi §5) |
| `LEGAL_*`, `DEMO_BOOKING_URL`, `LEADS_NOTIFY_EMAIL` | Dati societari nelle pagine legali, link di prenotazione demo, notifica dei lead |

## 3. Verifica dopo il deploy
- `https://<dominio>/api/health` → `{"status":"ok","database":"ok","email":"ok"}`
- Container `migrate` terminato con exit code 0, `backup` con `backup ok` nei log.
- Registrazione → email di verifica ricevuta → onboarding → simulazione → bozza → pubblicazione simulata.

## 4. Google Business Profile
Stato verificato il **26/10/2026**:
- Accesso alle **Business Profile APIs approvato** per il progetto `reputia-512221` (n. 937045868547).
- API abilitate: My Business Account Management API, My Business Business Information API e `mybusiness.googleapis.com` (v4, recensioni).
- Client OAuth **«Reputia Web»**, tipo **Applicazione web**, creato. Redirect URI: `${APP_URL}/api/google/callback`.
- Schermata di consenso configurata, app pubblicata (**In production**); scope `https://www.googleapis.com/auth/business.manage` elencato come **non sensibile**.
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` sono già nel `.env` locale. Impostarli anche nelle variabili Coolify e ridistribuire, senza copiarne i valori nel repository.

Per la sincronizzazione pianificata, genera `CRON_SECRET` con `openssl rand -base64 32`, impostalo nelle variabili Coolify e ridistribuisci. Configura uno scheduler esterno (per esempio cron) per eseguire periodicamente:

```bash
curl -X POST -H "x-cron-secret: $CRON_SECRET" https://<domain>/api/cron/sync
```

Lo scheduler deve ricevere `CRON_SECRET` dal proprio ambiente. Senza segreto configurato, o con header assente/errato, l'endpoint restituisce **401**. Ogni chiamata sincronizza le sedi non archiviate con collegamento Google attivo, con massimo tre sync contemporanee e controllo dell'abbonamento. La risposta contiene i conteggi `synced` e `failed` e `results` con `{locationId, created, updated, error?}`; una sede fallita non blocca le altre.

Il provider esegue al massimo **3 tentativi totali** per 429, 5xx o errori di rete, con backoff esponenziale da circa 500 ms e jitter. Rispetta `Retry-After` (secondi o data HTTP); se supera il budget cumulativo di 9 secondi di attesa, termina senza riprovare in anticipo. Gli altri 4xx non vengono ritentati. Gli errori di configurazione API non richiedono di ricollegare l'account.

La modalità simulazione rimane disponibile ed è etichettata nell'interfaccia. Il collegamento e la sincronizzazione reali sono stati verificati end-to-end **prima** del deploy (59 recensioni importate, secondo giro incrementale senza modifiche, token rinnovato). Dopo il deploy resta da rifare la stessa prova dal browser con una sede reale e, se serve, provare la pubblicazione di una risposta su una recensione di prova.

## 5. Stripe (sempre in modalità test fino all'approvazione del titolare)
1. Crea un **sandbox** Stripe e una chiave **ristretta** (`rk_test_…`) con accesso a Customers, Checkout Sessions, Billing Portal, Subscriptions, Subscription Items (scrittura) e Invoices (lettura).
2. Prodotto "Reputia Starter", prezzo ricorrente mensile €19 per unità (IVA esclusa, `tax_behavior: exclusive`) → `STRIPE_PRICE_ID`.
3. Customer Portal: abilita aggiornamento metodo di pagamento, fatture, disdetta a fine periodo.
4. Webhook su `${APP_URL}/api/stripe/webhook` con gli eventi: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created|updated|deleted|paused|resumed`, `invoice.paid`, `invoice.payment_failed`, `charge.dispute.created`, `charge.refunded`, `radar.early_fraud_warning.created` → `STRIPE_WEBHOOK_SECRET`.
5. **IVA**: imposta l'indirizzo della sede in Stripe Tax e aggiungi la registrazione italiana. Solo quando risulta *Collecting* imposta `STRIPE_AUTOMATIC_TAX=true` (prima, Stripe non applicherebbe l'IVA senza segnalarlo).
6. **Fatturazione elettronica**: le fatture B2B italiane devono passare dallo SDI. Stripe non lo fa da solo: serve un collegamento con un servizio di e-fattura (o l'emissione dal gestionale del commercialista). Da decidere prima dei pagamenti reali.
7. Le chiavi live (`sk_live_`/`rk_live_`) vengono rifiutate finché non si imposta `STRIPE_ALLOW_LIVE=true`.

## 6. Backup
- Il servizio `backup` salva un dump al giorno in `reputia_backups` (14 giorni). **Non basta**: copia i dump fuori dal server (Coolify S3 storage, rclone verso un bucket, ecc.).
- Ripristino di prova (da fare almeno una volta prima dei clienti reali):
  ```bash
  docker compose exec -T backup sh -c 'gunzip -c /backups/<file>.sql.gz' | docker compose exec -T db psql -U reputia -d reputia_restore_test
  ```

## 7. Rollback
- Applicazione: Coolify → Deployments → ridistribuisci il commit precedente.
- Database: le migrazioni devono essere solo additive (colonne nuove nullable o con default), così il codice precedente continua a funzionare. Le modifiche distruttive vanno divise in più rilasci. In caso estremo: ripristino dall'ultimo backup.

## Problemi comuni
| Sintomo | Causa probabile |
|---------|-----------------|
| `web` non parte | `migrate` fallito (log del servizio) o variabile obbligatoria mancante |
| Health `email: not_configured` | `SMTP_URL` mancante: registrazioni sospese |
| 502 | Dominio non associato a `web:3000` o health check fallito |
| Errore "Collegamento Google da riautorizzare" | Token revocato dall'utente: pulsante «Ricollega» nella pagina Google |
