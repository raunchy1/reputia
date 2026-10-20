export const GOOGLE_ERRORS: Record<string, string> = {
  permessi: "Solo il titolare o un amministratore può collegare Google.",
  "non-configurato": "Il collegamento con Google non è ancora configurato su questo server.",
  annullato: "Autorizzazione Google annullata.",
  scaduto: "Richiesta di collegamento non valida o scaduta. Riprova.",
  sessione: "La sessione è cambiata durante il collegamento. Riprova.",
  token: "Google non ha confermato l'autorizzazione. Riprova.",
  scope: "Serve il permesso di gestire la scheda dell'attività. Riprova e accetta tutte le autorizzazioni.",
  refresh: "Google non ha fornito un accesso permanente. Rimuovi Reputia dalle app collegate al tuo account Google e riprova.",
};

export function googleErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  return GOOGLE_ERRORS[code] ?? "Collegamento non riuscito. Riprova.";
}
