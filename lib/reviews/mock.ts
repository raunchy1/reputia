import type { ProviderLocation, ReviewPage, ReviewProvider } from "@/lib/reviews/types";

/**
 * Development/demo provider. Returns a fixed, realistic set of Italian reviews and
 * accepts replies without contacting any external service. The UI labels every
 * mock connection as "Simulazione".
 */
const SAMPLE: Array<[string, number, string | undefined, number]> = [
  ["Francesca Moretti", 5, "Cena splendida, il risotto ai funghi porcini era perfetto. Personale attento e simpatico, torneremo sicuramente.", 1],
  ["Luca Ferri", 2, "Abbiamo atteso più di 40 minuti per i secondi e nessuno ci ha avvisato del ritardo. Peccato, perché il cibo era buono.", 2],
  ["Giulia Bianchi", 4, "Ambiente curato e piatti generosi. Il tiramisù è da provare. Unica nota: un po' rumoroso il sabato sera.", 3],
  ["Marco Rossi", 5, undefined, 4],
  ["Elena Conti", 3, "Buona la pizza, impasto leggero. Il servizio però è stato un po' frettoloso e il conto è arrivato prima del caffè.", 6],
  ["Andrea Galli", 1, "Prenotazione non trovata nonostante la conferma via telefono. Esperienza deludente.", 8],
  ["Sara Lombardi", 5, "Siamo venuti per il compleanno di mia madre: hanno preparato tutto con grande cura. Grazie davvero!", 11],
  ["Davide Ricci", 4, "Ottimo rapporto qualità-prezzo, carta dei vini interessante. Ci torneremo.", 15],
  ["Chiara Marino", 5, "Accoglienza impeccabile, ci siamo sentiti a casa. Consigliatissimo.", 21],
  ["Paolo Greco", 2, "Porzioni piccole per il prezzo. Il personale gentile, ma non basta.", 27],
  ["Martina Costa", 5, "Il miglior pranzo della nostra vacanza. Prodotti freschi e un titolare appassionato.", 34],
  ["Roberto Fontana", 4, "Tutto buono, parcheggio un po' difficile in zona.", 45],
];

const DAY = 86_400_000;

export class MockReviewProvider implements ReviewProvider {
  readonly kind = "MOCK" as const;

  constructor(private readonly businessName: string) {}

  async listLocations(): Promise<ProviderLocation[]> {
    return [{ externalId: "mock/locations/1", name: this.businessName, address: "Indirizzo di esempio" }];
  }

  async listReviews(locationExternalId: string): Promise<ReviewPage> {
    const now = Date.now();
    return {
      reviews: SAMPLE.map(([authorName, rating, comment, daysAgo], i) => ({
        externalId: `${locationExternalId}/reviews/${i + 1}`,
        authorName,
        rating,
        comment,
        reviewedAt: new Date(now - daysAgo * DAY),
      })),
    };
  }

  async publishReply(): Promise<void> {}

  async deleteReply(): Promise<void> {}
}
