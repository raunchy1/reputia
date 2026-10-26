import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserError } from "@/lib/errors";
import { MockReviewProvider } from "@/lib/reviews/mock";
import { ProviderAuthError, ProviderConfigError, ProviderError, ProviderRateLimitError, type ProviderReview } from "@/lib/reviews/types";
import { syncLocation, syncLocationById } from "@/lib/services/sync";
import type { OrgContext } from "@/lib/session";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateLocation: vi.fn(),
  assertCanWrite: vi.fn(), providerFor: vi.fn(), listReviews: vi.fn(), markNeedsReconnect: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db: {
  location: { findFirst: mocks.findFirst, update: mocks.updateLocation },
  review: { findUnique: mocks.findUnique, create: mocks.create, update: mocks.update },
} }));
vi.mock("@/lib/billing/entitlement", () => ({ assertCanWrite: mocks.assertCanWrite }));
vi.mock("@/lib/services/connections", () => ({ providerFor: mocks.providerFor, markNeedsReconnect: mocks.markNeedsReconnect }));

const location = {
  id: "sede", organizationId: "org", name: "Sede di prova", externalLocationId: "accounts/1/locations/2",
  connection: { id: "conn", provider: "GOOGLE" },
};
const review: ProviderReview = {
  externalId: "accounts/1/locations/2/reviews/3", authorName: "Cliente", rating: 4,
  comment: "Recensione di prova", reviewedAt: new Date("2026-10-20T10:00:00Z"),
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.findFirst.mockResolvedValue(location);
  mocks.findUnique.mockResolvedValue(null);
  mocks.providerFor.mockReturnValue({ listReviews: mocks.listReviews });
  mocks.listReviews.mockResolvedValue({ reviews: [] });
});

describe("syncLocationById", () => {
  it("mantiene il vincolo dell'organizzazione e delega dalla sync con sessione", async () => {
    const ctx: OrgContext = {
      user: { id: "utente", name: "Test", email: "test@example.com" },
      organization: { id: "org", name: "Organizzazione", slug: "org" }, role: "owner",
    };
    expect(await syncLocation(ctx, "sede")).toEqual({ created: 0, updated: 0 });
    expect(mocks.findFirst).toHaveBeenCalledExactlyOnceWith({
      where: { id: "sede", organizationId: "org", archivedAt: null }, include: { connection: true },
    });
    expect(mocks.assertCanWrite).toHaveBeenCalledExactlyOnceWith("org");
    expect(mocks.updateLocation).toHaveBeenCalledWith({ where: { id: "sede" }, data: { lastSyncedAt: expect.any(Date) } });
  });

  it("blocca una sede di un'altra organizzazione prima di contattare il provider", async () => {
    mocks.findFirst.mockResolvedValue(null);
    await expect(syncLocationById("altra-org", "sede")).rejects.toBeInstanceOf(UserError);
    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "sede", organizationId: "altra-org", archivedAt: null } }));
    expect(mocks.providerFor).not.toHaveBeenCalled();
  });

  it("controlla l'abbonamento anche senza sessione", async () => {
    mocks.assertCanWrite.mockRejectedValue(new UserError("Abbonamento scaduto."));
    await expect(syncLocationById("org", "sede")).rejects.toThrow("Abbonamento scaduto.");
    expect(mocks.assertCanWrite).toHaveBeenCalledWith("org");
    expect(mocks.providerFor).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("crea e aggiorna le recensioni, poi si ferma alla prima pagina invariata", async () => {
    const reply = { text: "Grazie!", updatedAt: new Date("2026-10-21T10:00:00Z") };
    mocks.listReviews
      .mockResolvedValueOnce({ reviews: [review, { ...review, externalId: "modificata", reply }], nextPageToken: "seconda" })
      .mockResolvedValueOnce({ reviews: [review], nextPageToken: "terza" });
    mocks.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "esistente", rating: 3, comment: "Testo precedente", replyText: null, status: "NEW" })
      .mockResolvedValueOnce({ id: "invariata", rating: review.rating, comment: review.comment, replyText: null, status: "NEW" });
    expect(await syncLocationById("org", "sede")).toEqual({ created: 1, updated: 1 });
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ organizationId: "org", locationId: "sede", source: "GOOGLE", externalId: review.externalId }) });
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "esistente" }, data: expect.objectContaining({ rating: 4, replyText: "Grazie!", replyPublishedAt: reply.updatedAt, status: "PUBLISHED" }) });
    expect(mocks.listReviews).toHaveBeenCalledTimes(2);
    expect(mocks.listReviews).toHaveBeenNthCalledWith(2, location.externalLocationId, "seconda");
  });

  it("mantiene la sincronizzazione in simulazione", async () => {
    const mockLocation = { ...location, externalLocationId: "mock/locations/1", connection: { id: "mock-conn", provider: "MOCK" } };
    mocks.findFirst.mockResolvedValue(mockLocation);
    mocks.providerFor.mockReturnValue(new MockReviewProvider(mockLocation.name));
    expect(await syncLocationById("org", "sede")).toEqual({ created: 12, updated: 0 });
    expect(mocks.providerFor).toHaveBeenCalledWith(mockLocation.connection, mockLocation.name);
    expect(mocks.create.mock.calls.every(([args]) => args.data.source === "MOCK" && args.data.organizationId === "org")).toBe(true);
  });

  it.each([
    new ProviderAuthError("Ricollega l'account."),
    new ProviderConfigError("API non abilitata."),
    new ProviderRateLimitError("Troppe richieste."),
    new ProviderError("Errore temporaneo.", true),
  ])("segna la riconnessione soltanto per ProviderAuthError (%s)", async (error) => {
    mocks.listReviews.mockRejectedValue(error);
    await expect(syncLocationById("org", "sede")).rejects.toBe(error);
    if (error instanceof ProviderAuthError) expect(mocks.markNeedsReconnect).toHaveBeenCalledExactlyOnceWith("conn", error.message);
    else expect(mocks.markNeedsReconnect).not.toHaveBeenCalled();
    expect(mocks.updateLocation).not.toHaveBeenCalled();
  });
});
