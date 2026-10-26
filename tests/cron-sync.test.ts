import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/cron/sync/route";
import { UserError } from "@/lib/errors";

const { findMany, syncLocationById } = vi.hoisted(() => ({ findMany: vi.fn(), syncLocationById: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { location: { findMany } } }));
vi.mock("@/lib/services/sync", () => ({ syncLocationById }));

const secret = "cron-secret-di-prova";
const request = (header?: string) => new NextRequest("https://example.com/api/cron/sync", {
  method: "POST", headers: header === undefined ? {} : { "x-cron-secret": header },
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CRON_SECRET", secret);
  findMany.mockResolvedValue([]);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("POST /api/cron/sync", () => {
  it.each([undefined, "", "errato", "cron-secret-di-provX"])("rifiuta un header assente o errato (%s) prima del DB", async (header) => {
    const response = await POST(request(header));
    expect(response.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
    expect(syncLocationById).not.toHaveBeenCalled();
  });

  it.each([undefined, ""])("rifiuta CRON_SECRET non configurato (%s)", async (value) => {
    vi.stubEnv("CRON_SECRET", value);
    expect((await POST(request(secret))).status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("con il segreto corretto seleziona dal DB solo sedi non archiviate con Google attivo", async () => {
    const response = await POST(request(secret));
    expect(response.status).toBe(200);
    expect(findMany).toHaveBeenCalledExactlyOnceWith({
      where: { archivedAt: null, connection: { provider: "GOOGLE", status: "ACTIVE" } },
      select: { id: true, organizationId: true },
    });
    expect(await response.json()).toEqual({ synced: 0, failed: 0, results: [] });
  });

  it("raccoglie i conteggi e continua dopo una sede fallita senza esporre errori interni", async () => {
    findMany.mockResolvedValue([
      { id: "sede-a", organizationId: "org-a" }, { id: "sede-b", organizationId: "org-b" },
      { id: "sede-c", organizationId: "org-c" }, { id: "sede-d", organizationId: "org-d" },
    ]);
    syncLocationById
      .mockResolvedValueOnce({ created: 2, updated: 1 })
      .mockRejectedValueOnce(new Error("Dettaglio interno con token o testo recensione"))
      .mockRejectedValueOnce(new UserError("Abbonamento scaduto."))
      .mockResolvedValueOnce({ created: 0, updated: 3 });
    const response = await POST(request(secret));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      synced: 2, failed: 2,
      results: [
        { locationId: "sede-a", created: 2, updated: 1 },
        { locationId: "sede-b", created: 0, updated: 0, error: "Sincronizzazione non riuscita. Riprova più tardi." },
        { locationId: "sede-c", created: 0, updated: 0, error: "Abbonamento scaduto." },
        { locationId: "sede-d", created: 0, updated: 3 },
      ],
    });
    for (const suffix of ["a", "b", "c", "d"]) expect(syncLocationById).toHaveBeenCalledWith(`org-${suffix}`, `sede-${suffix}`);
  });

  it("limita a tre le sync contemporanee e completa tutte le sedi", async () => {
    vi.useFakeTimers();
    findMany.mockResolvedValue(Array.from({ length: 8 }, (_, index) => ({ id: `sede-${index}`, organizationId: "org" })));
    let active = 0;
    let peak = 0;
    syncLocationById.mockImplementation(async () => {
      peak = Math.max(peak, ++active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active--;
      return { created: 1, updated: 0 };
    });
    const pending = POST(request(secret));
    await vi.runAllTimersAsync();
    const response = await pending;
    expect(peak).toBe(3);
    expect(active).toBe(0);
    expect(syncLocationById).toHaveBeenCalledTimes(8);
    expect(await response.json()).toMatchObject({ synced: 8, failed: 0 });
  });
});
