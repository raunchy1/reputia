# Reputia — Design system (v2, «il punto»)

> v2 del 21 ottobre 2026. La v1 («calma operativa», accento indigo, Fraunces) è stata scartata perché ricadeva nei cliché dei prodotti AI:
> accento viola, icona «sparkles», titoli serif centrati, icone in riquadri, avatar pastello.
> Identità del marchio: `docs/brand/BRAND.md`.

## Direzione
Monocromo come Linear: inchiostro quasi nero per testo e azioni, carta calda per le superfici, linee sottili.
Un solo colore di marca, l'oro, usato **solo** per il punto: ciò che aspetta la tua parola e ciò che ha scritto l'assistente.
Densità da strumento professionale (righe da 30 px nella navigazione, metadati in monospace), tastiera di prima classe
(⌘K, J/K, /), sito con sezioni notte e la vera interfaccia come illustrazione.

## Token principali (`app/globals.css`)
| Token | Valore | Ruolo |
|---|---|---|
| `canvas` / `surface` / `subtle` | `#F7F7F5` / `#FFFFFF` / `#F2F2EF` | Carta, pannelli, hover |
| `ink` / `ink-2` | `#0E1116` / `#2B3038` | Testo e azioni |
| `muted` / `faint` | `#555B66` / `#646C7A` | Secondario, metadati (≥ 4.5:1 ovunque) |
| `line` / `line-strong` | `#EAEAE6` / `#DCDCD7` | Divisori, bordi dei campi |
| `accent` / `accent-soft` | `#0E1116` / `#EFEFEC` | Interazione monocroma, selezione |
| `gold` / `gold-bright` / `gold-ink` | `#D4961F` / `#E8B04A` / `#845400` | Il punto; su scuro; testo oro AA |
| `night` | `#0B0D10` | Sezioni scure del sito |

## Tipografia
Host Grotesk (interfaccia e titoli) + IBM Plex Mono (metadati). Titoli del sito 52–104 px, peso 600, spaziatura −5,5 %, interlinea 0,95.
App: 13 px liste e navigazione, 14 px corpo, 17 px testo delle recensioni, 30 px metriche.

## Elementi firma
- **Icone di stato disegnate** (`StatusIcon`): anello che si riempie verso la pubblicazione; punto oro = da gestire.
- **`AiMark`**: il punto oro marca il testo scritto dall'assistente. Mai scintille.
- **Paletta comandi ⌘K** con ricerca delle recensioni lato server; **J/K** per scorrere la casella, **/** per cercare.
- **Il punto tondo** chiude i titoli del sito (il punto del carattere è quadrato e non si usa).

---

## Spaziatura, raggi, ombre
- Griglia da 4 px. Righe di lista da 56–64 px, controlli da 32 (sm) / 36 (md) / 44 (lg).
- Raggi: `6px` controlli e badge, `10px` pannelli e menu, `16px` solo elementi grandi del sito.
- Ombre: nessuna sui pannelli dell'app (bastano le linee); `shadow-pop` solo per menu, dialog, toast.

## Iconografia
**Lucide** per le icone funzionali (tratto 1.75, 15–16 px, sempre con etichetta), **icone di stato proprie** per il flusso delle recensioni. Nessuna emoji, nessuna «sparkle».

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
