import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt, type PromptInput } from "@/lib/ai/prompt";
import { checkReply } from "@/lib/ai/safety";
import { isProduction } from "@/lib/env";
import { UserError } from "@/lib/errors";

export type GeneratedReply = {
  text: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costMicros: number;
  flags: string[];
};

export class AiUnavailableError extends UserError {}

type AiProvider = "anthropic" | "deepseek";

const DEFAULT_MODEL: Record<AiProvider, string> = { anthropic: "claude-opus-5-5", deepseek: "deepseek-flash" };
const API_KEY_ENV: Record<AiProvider, string> = { anthropic: "ANTHROPIC_API_KEY", deepseek: "DEEPSEEK_API_KEY" };

// USD per million tokens (input, output). Used only for the internal cost estimate.
// DeepSeek prices are not hardcoded: set AI_PRICE_INPUT_USD_MTOK / AI_PRICE_OUTPUT_USD_MTOK.
const PRICING: Record<string, [number, number]> = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
};

/** AI_PROVIDER wins; otherwise the provider whose key is set (DeepSeek first), else Anthropic. */
export function resolveProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "anthropic" || explicit === "deepseek") return explicit;
  if (explicit) throw new AiUnavailableError("Il servizio di intelligenza artificiale non è configurato correttamente.");
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  return "anthropic";
}

function estimateCostMicros(model: string, input: number, output: number): number {
  const envIn = Number(process.env.AI_PRICE_INPUT_USD_MTOK);
  const envOut = Number(process.env.AI_PRICE_OUTPUT_USD_MTOK);
  const [inPrice, outPrice] =
    process.env.AI_PRICE_INPUT_USD_MTOK && process.env.AI_PRICE_OUTPUT_USD_MTOK && Number.isFinite(envIn) && Number.isFinite(envOut)
      ? [envIn, envOut]
      : (PRICING[model] ?? [0, 0]);
  const usdToEur = Number(process.env.AI_USD_EUR_RATE ?? 0.92);
  return Math.round((input * inPrice + output * outPrice) * usdToEur);
}

export async function generateReply(input: PromptInput): Promise<GeneratedReply> {
  const provider = resolveProvider();
  const apiKey = process.env[API_KEY_ENV[provider]];
  if (!apiKey) {
    if (isProduction) throw new AiUnavailableError("Il servizio di intelligenza artificiale non è configurato.");
    return developmentReply(input);
  }
  const model = process.env.AI_MODEL?.trim() || DEFAULT_MODEL[provider];
  const result = provider === "deepseek" ? await generateWithDeepSeek(apiKey, model, input) : await generateWithAnthropic(model, input);
  if (!result.text) throw new AiUnavailableError("L'AI ha restituito una risposta vuota. Riprova.");
  return {
    ...result,
    provider,
    costMicros: estimateCostMicros(model, result.inputTokens, result.outputTokens),
    flags: checkReply(result.text),
  };
}

type RawReply = { text: string; model: string; inputTokens: number; outputTokens: number };

let anthropic: Anthropic | undefined;

async function generateWithAnthropic(model: string, input: PromptInput): Promise<RawReply> {
  anthropic ??= new Anthropic({ maxRetries: 2, timeout: 60_000 });
  let response;
  try {
    response = await anthropic.beta.messages.create({
      model,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: buildSystemPrompt(input), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildUserPrompt(input.review) }],
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) throw new AiUnavailableError("Servizio AI momentaneamente sovraccarico. Riprova tra un minuto.");
    if (error instanceof Anthropic.APIError) throw new AiUnavailableError("Il servizio AI non ha risposto correttamente. Riprova.");
    throw error;
  }
  if (response.stop_reason === "refusal") {
    throw new AiUnavailableError("L'AI non ha potuto proporre una risposta per questa recensione. Scrivila manualmente.");
  }
  const text = response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();
  return {
    text,
    model: response.model,
    inputTokens:
      response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0),
    outputTokens: response.usage.output_tokens,
  };
}

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_ATTEMPTS = 3;

type DeepSeekResponse = {
  model?: string;
  choices?: Array<{ message?: { content?: string | null }; finish_reason?: string }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

/** DeepSeek's OpenAI-compatible Chat Completions API. Prompt caching is automatic on their side. */
async function generateWithDeepSeek(apiKey: string, model: string, input: PromptInput): Promise<RawReply> {
  const body = JSON.stringify({
    model,
    max_tokens: 4000,
    reasoning_effort: "low",
    messages: [
      { role: "system", content: buildSystemPrompt(input) },
      { role: "user", content: buildUserPrompt(input.review) },
    ],
  });

  let data: DeepSeekResponse | undefined;
  for (let attempt = 0; attempt < DEEPSEEK_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
    let res: Response;
    try {
      res = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(60_000),
      });
    } catch {
      if (attempt < DEEPSEEK_ATTEMPTS - 1) continue;
      throw new AiUnavailableError("Il servizio AI non ha risposto. Riprova.");
    }
    if (res.ok) {
      try {
        data = (await res.json()) as DeepSeekResponse;
      } catch {
        throw new AiUnavailableError("Il servizio AI non ha risposto correttamente. Riprova.");
      }
      break;
    }
    // Never echo the response body: it is not shown to users and may contain request details.
    const retryable = res.status === 429 || res.status >= 500;
    if (retryable && attempt < DEEPSEEK_ATTEMPTS - 1) continue;
    if (res.status === 429) throw new AiUnavailableError("Servizio AI momentaneamente sovraccarico. Riprova tra un minuto.");
    if (res.status === 401 || res.status === 402 || res.status === 403) {
      console.error(`[ai] DeepSeek ha rifiutato la richiesta (HTTP ${res.status}): controllare chiave e credito.`);
      throw new AiUnavailableError("Il servizio di intelligenza artificiale non è disponibile. Contatta l'assistenza.");
    }
    throw new AiUnavailableError("Il servizio AI non ha risposto correttamente. Riprova.");
  }

  const choice = data?.choices?.[0];
  if (choice?.finish_reason === "content_filter") {
    throw new AiUnavailableError("L'AI non ha potuto proporre una risposta per questa recensione. Scrivila manualmente.");
  }
  if (choice?.finish_reason === "length") {
    throw new AiUnavailableError("La risposta dell'AI è stata interrotta. Riprova.");
  }
  return {
    text: (choice?.message?.content ?? "").trim(),
    model: data?.model ?? model,
    inputTokens: data?.usage?.prompt_tokens ?? 0,
    outputTokens: data?.usage?.completion_tokens ?? 0,
  };
}

/** Deterministic stand-in for local development without an API key. Never used in production. */
function developmentReply(input: PromptInput): GeneratedReply {
  const name = input.review.authorName.split(" ")[0];
  const base =
    input.review.rating >= 4
      ? `Grazie di cuore, ${name}! Siamo felici che la sua esperienza da ${input.businessName} sia stata positiva. La aspettiamo presto.`
      : input.review.rating === 3
        ? `Grazie ${name} per il suo riscontro. Condivideremo le sue osservazioni con il team per migliorare.`
        : `Gentile ${name}, ci dispiace che la sua esperienza non sia stata all'altezza delle aspettative. La invitiamo a contattarci direttamente per approfondire.`;
  const text = [`[Bozza di sviluppo — AI non configurata] ${base}`, input.signature.trim()].filter(Boolean).join("\n\n");
  return { text, provider: "development", model: "template", inputTokens: 0, outputTokens: 0, costMicros: 0, flags: checkReply(text) };
}
