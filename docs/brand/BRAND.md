# Reputia — Identità visiva

## L'idea: il punto
«Mettere il punto» significa avere l'ultima parola, con chiarezza. «Fare il punto» significa fare il bilancio.
È esattamente ciò che Reputia fa con le recensioni: ogni recensione riceve la risposta giusta e la conversazione si chiude bene.

Il punto d'oro è l'unico elemento grafico del marchio e attraversa tutto il prodotto:
- nel **simbolo** è il punto fermo dopo la «r»;
- nel **logotipo** è il puntino della «i»;
- nell'**interfaccia** segna ciò che aspetta il titolare (recensione da gestire, bozza scritta dall'assistente);
- nella **comunicazione** chiude i titoli: «Ogni recensione merita la risposta giusta.», «Mettiamoci un punto.».

Niente stelle, fumetti o scintille: sono i cliché del settore e dell'AI.

## Elementi
| File (`public/brand/`) | Uso |
|---|---|
| `reputia-wordmark.svg` / `-white.svg` | Logo principale: sito, documenti, email, fatture |
| `reputia-symbol.svg` / `-white.svg` | Simbolo «r.»: avatar social, timbri, spazi quadrati |
| `reputia-app-icon.svg` | Icona dell'app (r bianca e punto oro su inchiostro) |
| `reputia-favicon.svg`, `app/icon.svg`, `app/apple-icon.png` | Favicon: variante ottica per piccole dimensioni |

Componenti React: `Wordmark`, `LogoMark`, `LogoTile`, `Logo` in `components/ui/logo.tsx` (generati dalla stessa geometria).

## Costruzione
- **Logotipo:** «reputia» in Host Grotesk (OFL), peso 590, spaziatura −22/1000 em, convertito in tracciati. Il puntino originale della «i» è rimosso e sostituito da un cerchio oro di diametro pari al tratto verticale (×1,12, compensazione ottica). Script riproducibile: `docs/brand/build-wordmark.py`.
- **Simbolo:** la «r» di Host Grotesk peso 760 seguita da un punto fermo di diametro uguale allo spessore dell'asta (136/1000 em), appoggiato sulla linea di base, a 46/1000 em di distanza: la spaziatura di un vero punto tipografico.
- **Variante piccola (≤ 32 px):** punto +25 % e distanza ridotta a 30/1000 em, perché a 16 px il punto resti leggibile. Come i tagli ottici dei caratteri da stampa.

## Area di rispetto e dimensioni minime
- Area di rispetto: attorno al logotipo almeno l'altezza della «x»; attorno al simbolo almeno il diametro del punto ×2.
- Logotipo: almeno 72 px (schermo) / 20 mm (stampa) di larghezza.
- Simbolo: almeno 16 px, usando la variante piccola sotto i 32 px.

## Colori
| Nome | HEX | Uso |
|---|---|---|
| Inchiostro | `#0E1116` | Logotipo, testo, pulsanti principali |
| Notte | `#0B0D10` | Fondo delle sezioni scure |
| Carta | `#F7F7F5` | Fondo dell'app |
| Oro | `#D4961F` | Il punto, su fondi chiari |
| Oro chiaro | `#E8B04A` | Il punto, su fondi scuri |
| Oro testo | `#845400` | Testo in oro su fondo chiaro (contrasto AA) |

L'oro è riservato al punto e a ciò che rappresenta. Non si usa per sfondi grandi, pulsanti o testo lungo.

## Tipografia
- **Host Grotesk** per titoli e interfaccia. Titoli stretti (−4,5 / −5,5 % di spaziatura), pesi 590–600.
- **IBM Plex Mono** per metadati: orari, contatori, scorciatoie, didascalie.

## Da non fare
- Non cambiare il colore del punto, non sostituirlo con stelle o altri simboli.
- Non usare il punto quadrato del carattere: nel marchio il punto è sempre tondo.
- Non affiancare simbolo e logotipo («r. reputia» ripete la r): si usa l'uno o l'altro.
- Non deformare, ruotare o applicare ombre e gradienti al logo.
- Non comporre «reputia» con un carattere diverso: usare sempre i file forniti.
