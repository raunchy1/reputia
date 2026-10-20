// `\b` ignores accented letters (è, à…), so rules that may start or end with one use \p{L} lookarounds.
/**
 * Post-generation checks. The prompt already forbids these, but the model can
 * still slip, so flagged drafts are highlighted for the human approver.
 */
const RULES: Array<{ flag: string; label: string; pattern: RegExp }> = [
  { flag: "compenso", label: "Promette sconti, omaggi o compensi", pattern: /\b(scont[oi]|omaggi[oa]?|gratis|gratuit[oa]|in regalo|buono|voucher|coupon|offriamo|offerto da noi)\b/i },
  { flag: "rimborso", label: "Parla di rimborsi o risarcimenti", pattern: /\b(rimbors\w*|risarci\w*|restitu\w+ (il|i) (denaro|soldi|import\w*))\b/i },
  { flag: "ammissione", label: "Contiene un'ammissione di responsabilità", pattern: /(?<!\p{L})(è (stata|stato) colpa nostra|ci assumiamo (la|ogni|tutta la) responsabilità|abbiamo sbagliato|errore nostro)(?!\p{L})/iu },
  { flag: "contatti", label: "Contiene numeri o indirizzi email", pattern: /(\+?\d[\d\s.-]{7,}\d|[\w.+-]+@[\w-]+\.[\w.]+)/ },
];

export type SafetyFlag = (typeof RULES)[number]["flag"];

export function checkReply(text: string): string[] {
  return RULES.filter((r) => r.pattern.test(text)).map((r) => r.flag);
}

export function flagLabel(flag: string): string {
  return RULES.find((r) => r.flag === flag)?.label ?? flag;
}

/** Google rejects replies over 4096 bytes. */
export const MAX_REPLY_BYTES = 4096;

export function replyTooLong(text: string): boolean {
  return new TextEncoder().encode(text).length > MAX_REPLY_BYTES;
}
