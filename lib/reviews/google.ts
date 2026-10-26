import "server-only";
import { ProviderAuthError, ProviderConfigError, ProviderError, ProviderRateLimitError, type ProviderLocation, type ReviewPage, type ReviewProvider } from "@/lib/reviews/types";

const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const MAX_ATTEMPTS = 3;
const MAX_RETRY_WAIT_MS = 9_000;

function safeMessage(message: string, accessToken: string): string {
  // Rimuove le credenziali prima del troncamento, anche dalle risposte non JSON.
  return (accessToken ? message.split(accessToken).join("[omesso]") : message)
    .replace(/Bearer\s+[^\s"'<>]+/gi, "Bearer [omesso]")
    .replace(/((?:access_token|refresh_token|id_token|client_secret|authorization)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&}]+)/gi, "$1[omesso]")
    .replace(/\b(?:ya29\.[\w.-]+|1\/\/[\w.-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+)/g, "[omesso]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function googleError(status: number, body: string, url: string, accessToken: string): ProviderError {
  let code: unknown;
  let googleStatus: unknown;
  let message = body;
  let reasons: unknown[] = [];
  try {
    const json = JSON.parse(body);
    const error = json?.error;
    code = error?.code;
    googleStatus = typeof error === "string" ? error : error?.status;
    if (typeof error?.message === "string") message = error.message;
    if (Array.isArray(error?.details)) reasons = error.details.map((detail: { reason?: unknown } | null) => detail?.reason);
  } catch {
    // Google o un proxy possono rispondere con testo semplice.
  }
  const signals = [googleStatus, ...reasons];
  if (status === 401 || code === 401 || signals.includes("UNAUTHENTICATED") || signals.includes("invalid_grant")) {
    return new ProviderAuthError("L'autorizzazione Google non è più valida. Ricollega l'account.");
  }
  if (status === 429 || code === 429 || signals.includes("RESOURCE_EXHAUSTED") || signals.includes("RATE_LIMIT_EXCEEDED") || signals.includes("QUOTA_EXCEEDED")) {
    return new ProviderRateLimitError("Limite di richieste Google raggiunto. Riprova tra poco.");
  }
  if (signals.includes("SERVICE_DISABLED") || signals.includes("PERMISSION_DENIED")) {
    return new ProviderConfigError(`Accesso all'API ${new URL(url).hostname} non abilitato per il progetto Google Cloud. Contatta l'amministratore.`);
  }
  const detail = safeMessage(message, accessToken);
  return new ProviderError(`Errore Google (${status}). ${detail || "Riprova più tardi."}`, status >= 500 && status < 600);
}

function retryAfterMs(value: string | null): number {
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 0;
}

type GoogleReview = {
  name: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean };
  starRating?: string;
  comment?: string;
  createTime: string;
  reviewReply?: { comment: string; updateTime: string };
};

/**
 * Google Business Profile provider.
 * - Accounts: My Business Account Management API v1
 * - Locations: My Business Business Information API v1
 * - Reviews: My Business API v4 (accounts/{a}/locations/{l}/reviews)
 * Requires the business.manage scope and an approved GBP API project.
 */
export class GoogleReviewProvider implements ReviewProvider {
  readonly kind = "GOOGLE" as const;

  constructor(private readonly getAccessToken: () => Promise<string>) {}

  private async call<T>(url: string, init?: RequestInit): Promise<T> {
    const accessToken = await this.getAccessToken();
    let waited = 0;
    // Tre tentativi totali; al massimo 9 secondi di attesa fra i tentativi.
    for (let attempt = 0; ; attempt++) {
      let res: Response | undefined;
      try {
        let body: string;
        try {
          res = await fetch(url, {
            ...init,
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...init?.headers },
            cache: "no-store",
          });
          body = await res.text();
        } catch {
          throw new ProviderError("Impossibile contattare Google. Riprova tra poco.", true);
        }
        if (!res.ok) throw googleError(res.status, body, url, accessToken);
        if (res.status === 204 || !body) return undefined as T;
        try {
          return JSON.parse(body) as T;
        } catch {
          throw new ProviderError("Google ha restituito una risposta non valida. Riprova più tardi.");
        }
      } catch (error) {
        if (!(error instanceof ProviderError) || !error.retryable || attempt >= MAX_ATTEMPTS - 1) throw error;
        if (res && res.status >= 400 && res.status < 500 && res.status !== 429) throw error;
        const delay = Math.max(500 * 2 ** attempt * (1 + Math.random()), retryAfterMs(res?.headers.get("Retry-After") ?? null));
        // Se Retry-After supera il budget, termina senza anticipare la richiesta.
        if (waited + delay > MAX_RETRY_WAIT_MS) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        waited += delay;
      }
    }
  }

  async listLocations(): Promise<ProviderLocation[]> {
    const accounts = await this.call<{ accounts?: Array<{ name: string }> }>("https://mybusinessaccountmanagement.googleapis.com/v1/accounts");
    const result: ProviderLocation[] = [];
    for (const account of accounts.accounts ?? []) {
      let pageToken: string | undefined;
      do {
        const params = new URLSearchParams({ readMask: "name,title,storefrontAddress", pageSize: "100" });
        if (pageToken) params.set("pageToken", pageToken);
        const page = await this.call<{
          locations?: Array<{ name: string; title: string; storefrontAddress?: { addressLines?: string[]; locality?: string } }>;
          nextPageToken?: string;
        }>(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?${params}`);
        for (const loc of page.locations ?? []) {
          const address = [...(loc.storefrontAddress?.addressLines ?? []), loc.storefrontAddress?.locality].filter(Boolean).join(", ");
          // Le recensioni v4 richiedono il nome completo: accounts/{a}/locations/{l}.
          result.push({ externalId: `${account.name}/${loc.name}`, name: loc.title, address: address || undefined });
        }
        pageToken = page.nextPageToken;
      } while (pageToken);
    }
    return result;
  }

  async listReviews(locationExternalId: string, pageToken?: string): Promise<ReviewPage> {
    const params = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await this.call<{ reviews?: GoogleReview[]; nextPageToken?: string }>(
      `https://mybusiness.googleapis.com/v4/${locationExternalId}/reviews?${params}`,
    );
    return {
      nextPageToken: page.nextPageToken,
      reviews: (page.reviews ?? []).flatMap((r) => {
        const rating = STARS[r.starRating ?? ""];
        if (!rating) return [];
        return [
          {
            externalId: r.name,
            authorName: r.reviewer?.isAnonymous ? "Utente Google" : r.reviewer?.displayName || "Utente Google",
            authorPhotoUrl: r.reviewer?.isAnonymous ? undefined : r.reviewer?.profilePhotoUrl,
            rating,
            comment: r.comment,
            reviewedAt: new Date(r.createTime),
            reply: r.reviewReply ? { text: r.reviewReply.comment, updatedAt: new Date(r.reviewReply.updateTime) } : undefined,
          },
        ];
      }),
    };
  }

  async publishReply(_location: string, reviewExternalId: string, text: string): Promise<void> {
    await this.call(`https://mybusiness.googleapis.com/v4/${reviewExternalId}/reply`, { method: "PUT", body: JSON.stringify({ comment: text }) });
  }

  async deleteReply(_location: string, reviewExternalId: string): Promise<void> {
    await this.call(`https://mybusiness.googleapis.com/v4/${reviewExternalId}/reply`, { method: "DELETE" });
  }
}
