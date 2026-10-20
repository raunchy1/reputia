import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  APP_URL: z.url().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  SMTP_URL: z.string().optional(),
  EMAIL_FROM: z.string().default("Reputia <noreply@reputia.it>"),
});

export const env = schema.parse(process.env);

export const isProduction = env.NODE_ENV === "production";

/** Verification and reset emails cannot be delivered, so new sign-ups would be stranded. */
export const emailDeliveryAvailable = Boolean(env.SMTP_URL) || !isProduction;
