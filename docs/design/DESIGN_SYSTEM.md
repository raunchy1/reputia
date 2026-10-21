# Reputia — Design system

Direzione scelta: **«Calma operativa»**. Un prodotto di lavoro quotidiano, sobrio e preciso come Linear e Intercom
(vedi `MOBBIN_RESEARCH.md`), con un'identità italiana affidata alla tipografia editoriale del sito pubblico.
Un solo accento, superfici piatte, linee sottili, densità media: un titolare deve capire lo stato delle recensioni
in tre secondi senza sentirsi in un pannello per sviluppatori.

Token in `app/globals.css` (`@theme`). Nei componenti si usano solo i nomi semantici, mai valori esadecimali.

## Colore
| Token | Valore | Uso |
|-------|--------|-----|
| `canvas` | `#FAFAF8` | Sfondo dell'app e della sidebar |
| `surface` | `#FFFFFF` | Pannelli, liste, campi |
| `subtle` | `#F4F4F1` | Hover, righe selezionate, sezioni secondarie |
| `ink` | `#1B2430` | Testo principale, pulsante primario |
| `ink-2` | `#3A4553` | Testo forte secondario |
| `muted` | `#545C6A` | Testo secondario (6.6:1 su bianco) |
| `faint` | `#666E7C` | Metadati, date, placeholder (≥ 4.6:1 su tutte le superfici, verificato con axe) |
| `line` | `#E8E8E3` | Divisori e bordi |
| `line-strong` | `#D9D9D2` | Bordi dei campi |
| `accent` | `#4C51C6` | Unico accento: selezione, AI, link, focus |
| `accent-soft` | `#EEEFFB` | Sfondi dell'accento |
| `positive` / `-soft` | `#1D7A50` / `#E9F5EE` | Pubblicata, collegato |
| `warning` / `-soft` | `#9A5B0F` / `#FBF2E2` | Bozza, simulazione, prova in scadenza |
| `danger` / `-soft` | `#B42318` / `#FCEDEB` | Errore, recensioni 1–2 stelle (solo come segno, mai come sfondo pieno) |
| `star` | `#D9962B` | Stelle |

Niente gradienti nell'app. Il sito usa un solo sfondo scuro (`ink`) per la sezione «Perché rispondere».

## Tipografia
Due famiglie, entrambe con ottimo supporto per le lettere accentate italiane:
- **Geist** — tutta l'interfaccia, i numeri (`tabular-nums`) e il corpo del sito.
- **Fraunces** (assi `opsz`, `SOFT`) — solo titoli del sito pubblico e dei passaggi di autenticazione. Dà il carattere editoriale europeo che distingue Reputia dai SaaS generici; non entra mai nell'app operativa.

Scala dell'app (px / line-height): 12/16 metadati · 13/20 etichette, liste · 14/22 corpo · 16/24 testo recensioni · 20/28 titoli di pannello · 24/32 titoli di pagina · 28/34 metriche.
Sito: 48–72 hero (Fraunces 400), 36–44 titoli di sezione, 17/28 corpo.

## Spaziatura, raggi, ombre
- Griglia da 4 px. Righe di lista da 56–64 px, controlli da 32 (sm) / 36 (md) / 44 (lg).
- Raggi: `6px` controlli e badge, `10px` pannelli e menu, `16px` solo elementi grandi del sito.
- Ombre: nessuna sui pannelli dell'app (bastano le linee); `shadow-pop` solo per menu, dialog, toast.

## Iconografia
**Lucide** (già nel progetto, tree-shaking, set ampio e neutro). Tratto `1.75`, 16 px nella UI, 18 px nella navigazione, sempre affiancate da un'etichetta testuale. Nessuna emoji come icona.

## Layout dell'app
- Sidebar 232 px, comprimibile a 56 px (solo icone con tooltip); stato salvato in un cookie.
- Contenuto in un pannello `surface` rientrato di 8 px sulla tela, con bordo `line` e raggio 10 (modello Linear).
- Barra superiore del pannello: titolo/briciole a sinistra, selettore sede e azioni a destra.
- Larghezze di lettura: testi lunghi ≤ 68 caratteri; impostazioni in due colonne (spiegazione / controllo).
- Mobile (< 1024 px): sidebar a scomparsa, inbox lista → dettaglio a schermo intero.

## Movimento
CSS, senza librerie: tutte le interazioni del brief sono transizioni semplici e una libreria di animazione
aggiungerebbe ~40 KB per nulla.
| Interazione | Durata | Curva |
|-------------|--------|-------|
| Hover / press | 120 ms | `ease-out` |
| Menu, tooltip, toast in entrata | 160 ms | `cubic-bezier(.2,.8,.2,1)` |
| Dialog, cambio pannello, passo di onboarding | 200 ms | idem |
| Sidebar comprimi/espandi | 200 ms | idem |
Generazione AI: il pulsante mostra uno spinner, il composer mostra righe «skeleton» che scorrono e la scritta «L'assistente sta scrivendo…»; al termine il testo appare con una dissolvenza di 200 ms. Nessuna animazione continua decorativa. `prefers-reduced-motion` azzera tutte le durate.

## Stati delle recensioni
| Stato DB | Etichetta | Tono |
|----------|-----------|------|
| `NEW` | Da gestire | accent |
| `DRAFT` | Bozza pronta | warning |
| `APPROVED` | Da approvare | warning (bozza inviata al titolare da un collaboratore) |
| `PUBLISHED` | Pubblicata | positive |
| `FAILED` | Errore | danger |
| `IGNORED` | Archiviata | neutral |

## Componenti
`components/ui`: Button, Field/Input/Textarea/Select, Badge, Stars, Notice, Kbd, Skeleton, EmptyState, Dialog (Radix), Menu (Radix), Tooltip (Radix), Toaster (sonner).
`components/app`: AppShell, Sidebar, Topbar, LocationSwitcher, PageHeader, MetricStrip.
`components/reviews`: ReviewFilters, ReviewList, ReviewRow, ReviewDetail, ReplyComposer, StatusBadge, RatingMark.

## Regole
- Un'azione primaria per vista.
- Ogni dato mostrato viene dal database; i dati dimostrativi sono marcati «Simulazione».
- Le funzioni non disponibili si mostrano disabilitate con il motivo, mai come se funzionassero.
- Focus sempre visibile (anello `accent` 2 px). Obiettivo WCAG 2.2 AA.
