"use client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ plugins: [organizationClient()] });

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email o password non corretti.",
  EMAIL_NOT_VERIFIED: "Devi prima confermare il tuo indirizzo email.",
  USER_ALREADY_EXISTS: "Esiste già un account con questa email.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Esiste già un account con questa email.",
  PASSWORD_TOO_SHORT: "La password deve avere almeno 10 caratteri.",
  PASSWORD_TOO_LONG: "La password è troppo lunga.",
  INVALID_TOKEN: "Il link non è valido o è scaduto. Richiedine uno nuovo.",
  INVALID_EMAIL: "Indirizzo email non valido.",
};

export function authErrorMessage(error: { code?: string; status?: number } | null | undefined): string {
  if (!error) return "";
  if (error.status === 429) return "Troppi tentativi. Attendi qualche minuto e riprova.";
  return (error.code && MESSAGES[error.code]) || "Si è verificato un errore. Riprova tra poco.";
}
