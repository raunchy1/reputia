import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleReviewProvider } from "@/lib/reviews/google";
import { ProviderAuthError, ProviderConfigError, ProviderError, ProviderRateLimitError } from "@/lib/reviews/types";

const fetchMock = vi.fn<typeof fetch>();
const token = "test-access-token";
const location = "accounts/123/locations/456";
const provider = () => new GoogleReviewProvider(async () => token);
const json = (body: unknown, status = 200, headers?: HeadersInit) => new Response(JSON.stringify(body), { status, headers });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-26T10:00:00Z"));
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function failure() {
  const result = provider().listReviews(location).catch((error: unknown) => error);
  await vi.runAllTimersAsync();
  return result;
}

describe("GoogleReviewProvider", () => {
  it("mappa le sedi di tutti gli account, segue le pagine e qualifica gli ID", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ accounts: [{ name: "accounts/123" }, { name: "accounts/789" }] }))
      .mockResolvedValueOnce(json({
        locations: [{ name: "locations/456", title: "Sede A", storefrontAddress: { addressLines: ["Via Roma 1"], locality: "Cagliari" } }],
        nextPageToken: "pagina + 2",
      }))
      .mockResolvedValueOnce(json({ locations: [{ name: "locations/457", title: "Sede B" }] }))
      .mockResolvedValueOnce(json({ locations: [{ name: "locations/999", title: "Sede C", storefrontAddress: { locality: "Sassari" } }] }));

    expect(await provider().listLocations()).toEqual([
      { externalId: location, name: "Sede A", address: "Via Roma 1, Cagliari" },
      { externalId: "accounts/123/locations/457", name: "Sede B", address: undefined },
      { externalId: "accounts/789/locations/999", name: "Sede C", address: "Sassari" },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[0][0]).toBe("https://mybusinessaccountmanagement.googleapis.com/v1/accounts");
    const firstPage = new URL(String(fetchMock.mock.calls[1][0]));
    expect(firstPage.origin + firstPage.pathname).toBe("https://mybusinessbusinessinformation.googleapis.com/v1/accounts/123/locations");
    expect(firstPage.searchParams.get("readMask")).toBe("name,title,storefrontAddress");
    expect(firstPage.searchParams.has("pageToken")).toBe(false);
    expect(new URL(String(fetchMock.mock.calls[2][0])).searchParams.get("pageToken")).toBe("pagina + 2");
    expect(new URL(String(fetchMock.mock.calls[3][0])).searchParams.has("pageToken")).toBe(false);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  });

  it("mappa stelle, anonimato e risposta, e passa il token pagina", async () => {
    const createTime = "2026-10-20T10:00:00Z";
    const updateTime = "2026-10-21T11:00:00Z";
    fetchMock.mockResolvedValueOnce(json({
      reviews: ["ONE", "TWO", "THREE", "FOUR", "FIVE", "STAR_RATING_UNSPECIFIED"].map((starRating, index) => ({
        name: `${location}/reviews/${index}`,
        starRating,
        createTime,
        reviewer: { displayName: "Cliente", profilePhotoUrl: "https://example.com/avatar.jpg", isAnonymous: index === 0 },
        comment: "Recensione di prova",
        ...(index === 0 ? { reviewReply: { comment: "Grazie!", updateTime } } : {}),
      })),
      nextPageToken: "successiva",
    }));
    const page = await provider().listReviews(location, "pagina + 2");
    expect(page.nextPageToken).toBe("successiva");
    expect(page.reviews.map((review) => review.rating)).toEqual([1, 2, 3, 4, 5]);
    expect(page.reviews[0]).toEqual({
      externalId: `${location}/reviews/0`, authorName: "Utente Google", authorPhotoUrl: undefined,
      rating: 1, comment: "Recensione di prova", reviewedAt: new Date(createTime),
      reply: { text: "Grazie!", updatedAt: new Date(updateTime) },
    });
    expect(page.reviews[1]).toMatchObject({ authorName: "Cliente", authorPhotoUrl: "https://example.com/avatar.jpg", reply: undefined });
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin + url.pathname).toBe(`https://mybusiness.googleapis.com/v4/${location}/reviews`);
    expect(Object.fromEntries(url.searchParams)).toEqual({ pageSize: "50", orderBy: "updateTime desc", pageToken: "pagina + 2" });
  });

  it("pubblica la risposta con PUT e il campo comment", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await provider().publishReply(location, `${location}/reviews/abc`, "Grazie per la visita!");
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`https://mybusiness.googleapis.com/v4/${location}/reviews/abc/reply`, expect.objectContaining({
      method: "PUT", body: JSON.stringify({ comment: "Grazie per la visita!" }),
    }));
  });

  it.each([
    [401, { code: 401, message: "Token scaduto" }],
    [403, { status: "UNAUTHENTICATED" }],
    [400, "invalid_grant"],
    [400, { details: [{ reason: "invalid_grant" }] }],
  ])("richiede di ricollegare solo per autenticazione non valida (%s)", async (status, error) => {
    fetchMock.mockImplementation(async () => json({ error }, status));
    const result = await failure();
    expect(result).toBeInstanceOf(ProviderAuthError);
    expect(result).toMatchObject({ retryable: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    { code: 403, status: "PERMISSION_DENIED", details: [{ reason: "SERVICE_DISABLED" }], message: "API disabled for project 937045868547" },
    { code: 403, status: "PERMISSION_DENIED", message: "Project reputia-512221 has not been granted access" },
    { code: 403, details: [{ reason: "SERVICE_DISABLED" }] },
  ])("distingue gli errori di configurazione dall'autenticazione", async (error) => {
    fetchMock.mockImplementation(async () => json({ error }, 403));
    const result = await failure();
    expect(result).toBeInstanceOf(ProviderConfigError);
    expect(result).not.toBeInstanceOf(ProviderAuthError);
    expect(result).toMatchObject({ retryable: false, message: expect.stringContaining("mybusiness.googleapis.com") });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ritenta il 429 esattamente tre volte rispettando Retry-After in secondi", async () => {
    fetchMock.mockImplementation(async () => json({ error: { code: 429, status: "RESOURCE_EXHAUSTED" } }, 429, { "Retry-After": "2" }));
    const result = provider().listReviews(location).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(1999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1999);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toBeInstanceOf(ProviderRateLimitError);
    expect(await result).toMatchObject({ retryable: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("rispetta Retry-After come data HTTP e recupera al secondo tentativo", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ error: { status: "RESOURCE_EXHAUSTED" } }, 429, { "Retry-After": new Date(Date.now() + 3000).toUTCString() }))
      .mockResolvedValueOnce(json({ reviews: [] }));
    const result = provider().listReviews(location);
    await vi.advanceTimersByTimeAsync(2999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toEqual({ reviews: [], nextPageToken: undefined });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each(["30", "5"])("non supera il budget di attesa con Retry-After=%s", async (retryAfter) => {
    const start = Date.now();
    fetchMock.mockImplementation(async () => json({ error: { status: "RESOURCE_EXHAUSTED" } }, 429, { "Retry-After": retryAfter }));
    expect(await failure()).toBeInstanceOf(ProviderRateLimitError);
    expect(fetchMock).toHaveBeenCalledTimes(retryAfter === "30" ? 1 : 2);
    expect(Date.now() - start).toBeLessThan(10_000);
  });

  it.each([500, 502, 503])("ritenta il %s esattamente tre volte con backoff esponenziale e jitter", async (status) => {
    const start = Date.now();
    fetchMock.mockImplementation(async () => json({ error: { code: status, status: "INTERNAL", message: "Errore temporaneo" } }, status));
    const result = await failure();
    expect(result).toBeInstanceOf(ProviderError);
    expect(result).not.toBeInstanceOf(ProviderAuthError);
    expect(result).toMatchObject({ retryable: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(Date.now() - start).toBe(750 + 1500);
  });

  it("ritenta gli errori di rete senza esporre il messaggio originale", async () => {
    fetchMock.mockRejectedValue(new TypeError(`fetch failed: ${token}`));
    const result = await failure();
    expect(result).toBeInstanceOf(ProviderError);
    expect(result).toMatchObject({ retryable: true, message: "Impossibile contattare Google. Riprova tra poco." });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it.each([400, 403, 404])("non ritenta gli altri 4xx (%s) e oscura i token prima di troncare il corpo", async (status) => {
    fetchMock.mockImplementation(async () => new Response(`${token} Bearer altro-token refresh_token=segreto ${"x".repeat(400)}`, { status }));
    const result = await failure();
    expect(result).toBeInstanceOf(ProviderError);
    expect(result).not.toBeInstanceOf(ProviderAuthError);
    expect(result).toMatchObject({ retryable: false });
    const message = (result as ProviderError).message;
    expect(message).not.toMatch(/test-access-token|altro-token|segreto/);
    expect(message.length).toBeLessThanOrEqual(225);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("classifica RESOURCE_EXHAUSTED senza ritentare un 4xx diverso da 429", async () => {
    fetchMock.mockImplementation(async () => json({ error: { status: "RESOURCE_EXHAUSTED" } }, 400));
    expect(await failure()).toBeInstanceOf(ProviderRateLimitError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
