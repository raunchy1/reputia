import "server-only";
import { ProviderAuthError, ProviderError, type ProviderLocation, type ReviewPage, type ReviewProvider } from "@/lib/reviews/types";

const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

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
    const res = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${await this.getAccessToken()}`, "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      const detail = await res.text().catch(() => "");
      throw new ProviderAuthError(`Google ha rifiutato l'accesso (${res.status}). ${detail.slice(0, 200)}`);
    }
    if (!res.ok) throw new ProviderError(`Errore Google ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
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
          // v4 reviews need the account-qualified name: accounts/{a}/locations/{l}
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
