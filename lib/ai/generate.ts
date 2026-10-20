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

const MODEL = process.env.AI_MODEL || "claude-opus-5-5";

// USD per million tokens (input, output). Used only for the internal cost estimate.
const PRICING: Record<string, [number, number]> = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
};
const USD_TO_EUR = Number(process.env.AI_USD_EUR_RATE ?? 0.92);

function estimateCostMicros(model: string, input: number, output: number): number {
  const [inPrice, outPrice] = PRICING[model] ?? PRICING["claude-opus-5-5"];
  return Math.round((input * inPrice + output * outPrice) * USD_TO_EUR);
}

let client: Anthropic | undefined;

export async function generateReply(input: PromptInput): Promise<GeneratedReply> {
  if (!process.env.ANTHROPIC_API_KEY) {
    if (isProduction) throw new AiUnavailableError("Il servizio di intelligenza artificiale non è configurato.");
    return developmentReply(input);
  }
  client ??= new Anthropic({ maxRetries: 2, timeout: 60_000 });

  let response;
  try {
    response = await client.beta.messages.create({
      model: MODEL,
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
  if (!text) throw new AiUnavailableError("L'AI ha restituito una risposta vuota. Riprova.");

  const inputTokens =
    response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0);
  const outputTokens = response.usage.output_tokens;
  return {
    text,
    provider: "anthropic",
    model: response.model,
    inputTokens,
    outputTokens,
    costMicros: estimateCostMicros(MODEL, inputTokens, outputTokens),
    flags: checkReply(text),
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
