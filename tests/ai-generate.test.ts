import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const envState = vi.hoisted(() => ({ production: false }));
vi.mock("@/lib/env", () => ({
  get isProduction() {
    return envState.production;
  },
}));

import { AiUnavailableError, generateReply, resolveProvider } from "@/lib/ai/generate";

const KEY = "sk-test-deepseek";
const fetchMock = vi.fn<typeof fetch>();
const input = {
  businessName: "Trattoria da Gino",
  category: "Ristorante",
  businessContext: "",
  signature: "Gino",
  tone: "CORDIALE" as const,
  length: "MEDIA" as const,
  review: { authorName: "Maria Rossi", rating: 5, comment: "Pasta ottima!" },
};
const completion = (content: string | null, finish = "stop", status = 200) =>
  new Response(
    JSON.stringify({
      model: "deepseek-flash",
      choices: [{ message: { content }, finish_reason: finish }],
      usage: { prompt_tokens: 1200, completion_tokens: 150 },
    }),
    { status },
  );
const status = (code: number) => new Response(JSON.stringify({ error: { message: `fail ${KEY}` } }), { status: code });

async function settle<T>(promise: Promise<T>) {
  const result = promise.catch((error: unknown) => error);
  await vi.runAllTimersAsync();
  return result;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.unstubAllEnvs();
  vi.stubEnv("AI_PROVIDER", "");
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  vi.stubEnv("DEEPSEEK_API_KEY", KEY);
  vi.stubEnv("AI_MODEL", "");
  vi.stubEnv("AI_PRICE_INPUT_USD_MTOK", "");
  vi.stubEnv("AI_PRICE_OUTPUT_USD_MTOK", "");
  envState.production = false;
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("resolveProvider", () => {
  it("usa AI_PROVIDER se impostato, altrimenti la chiave presente", () => {
    expect(resolveProvider()).toBe("deepseek");
    vi.stubEnv("AI_PROVIDER", "Anthropic");
    expect(resolveProvider()).toBe("anthropic");
    vi.stubEnv("AI_PROVIDER", "");
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    expect(resolveProvider()).toBe("anthropic");
  });
  it("rifiuta un provider sconosciuto", () => {
    vi.stubEnv("AI_PROVIDER", "openai");
    expect(() => resolveProvider()).toThrow(AiUnavailableError);
  });
});

describe("generateReply con DeepSeek", () => {
  it("invia prompt di sistema e recensione, con effort basso e modello predefinito", async () => {
    fetchMock.mockResolvedValueOnce(completion("  Grazie Maria!\n\nGino  "));
    const reply = await generateReply(input);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.deepseek.com/chat/completions");
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    const body = JSON.parse(init?.body as string);
    expect(body.model).toBe("deepseek-flash");
    expect(body.reasoning_effort).toBe("low");
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toContain("Trattoria da Gino");
    expect(body.messages[1].content).toContain("Pasta ottima!");

    expect(reply).toMatchObject({ text: "Grazie Maria!\n\nGino", provider: "deepseek", model: "deepseek-flash", inputTokens: 1200, outputTokens: 150, costMicros: 0 });
    expect(reply.flags).toEqual([]);
  });

  it("rispetta AI_MODEL e i prezzi configurati", async () => {
    vi.stubEnv("AI_MODEL", "deepseek-v4-pro");
    vi.stubEnv("AI_PRICE_INPUT_USD_MTOK", "1");
    vi.stubEnv("AI_PRICE_OUTPUT_USD_MTOK", "2");
    vi.stubEnv("AI_USD_EUR_RATE", "1");
    fetchMock.mockResolvedValueOnce(completion("Grazie!"));
    const reply = await generateReply(input);
    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string).model).toBe("deepseek-v4-pro");
    expect(reply.costMicros).toBe(1200 * 1 + 150 * 2);
  });

  it("ritenta su 429 e 5xx, poi riesce", async () => {
    fetchMock.mockResolvedValueOnce(status(429)).mockResolvedValueOnce(status(503)).mockResolvedValueOnce(completion("Grazie!"));
    const reply = await settle(generateReply(input));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(reply).toMatchObject({ text: "Grazie!" });
  });

  it("ritenta gli errori di rete e si arrende dopo tre tentativi", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const error = await settle(generateReply(input));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(error).toBeInstanceOf(AiUnavailableError);
  });

  it("non ritenta chiave errata o credito esaurito e non espone la chiave", async () => {
    for (const code of [401, 402]) {
      fetchMock.mockReset().mockResolvedValueOnce(status(code));
      const error = await settle(generateReply(input));
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(AiUnavailableError);
      expect((error as Error).message).not.toContain(KEY);
      expect((error as Error).message).toContain("Contatta l'assistenza");
    }
  });

  it("gestisce filtro dei contenuti, troncamento e risposta vuota", async () => {
    fetchMock.mockResolvedValueOnce(completion("", "content_filter"));
    expect(await settle(generateReply(input))).toHaveProperty("message", expect.stringContaining("Scrivila manualmente"));
    fetchMock.mockResolvedValueOnce(completion("Grazie per", "length"));
    expect(await settle(generateReply(input))).toHaveProperty("message", expect.stringContaining("interrotta"));
    fetchMock.mockResolvedValueOnce(completion(null));
    expect(await settle(generateReply(input))).toHaveProperty("message", expect.stringContaining("vuota"));
  });

  it("segnala le bozze rischiose", async () => {
    fetchMock.mockResolvedValueOnce(completion("Le offriamo uno sconto del 20% sulla prossima visita."));
    const reply = await generateReply(input);
    expect(reply.flags.length).toBeGreaterThan(0);
  });
});

describe("generateReply senza chiave", () => {
  it("in sviluppo usa la bozza di esempio senza chiamare la rete", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    vi.stubEnv("AI_PROVIDER", "deepseek");
    const reply = await generateReply(input);
    expect(reply.provider).toBe("development");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("in produzione restituisce un errore esplicito", async () => {
    envState.production = true;
    vi.stubEnv("DEEPSEEK_API_KEY", "");
    vi.stubEnv("AI_PROVIDER", "deepseek");
    await expect(generateReply(input)).rejects.toThrow("non è configurato");
  });
});
