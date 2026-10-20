import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins/organization";
import { db } from "@/lib/db";
import { actionEmail, sendEmail } from "@/lib/email";
import { env, isProduction } from "@/lib/env";

if (isProduction && !env.BETTER_AUTH_SECRET && process.env.NEXT_PHASE !== "phase-production-build") {
  throw new Error("BETTER_AUTH_SECRET mancante");
}

export const auth = betterAuth({
  appName: "Reputia",
  baseURL: env.APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        actionEmail({
          to: user.email,
          subject: "Reimposta la password di Reputia",
          greeting: `Ciao ${user.name},`,
          body: "abbiamo ricevuto una richiesta di reimpostazione della password del tuo account.",
          cta: "Scegli una nuova password",
          url,
          footer: "Il link scade tra un'ora. Se non hai fatto tu la richiesta, ignora questa email: la password resta invariata.",
        }),
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(
        actionEmail({
          to: user.email,
          subject: "Conferma il tuo indirizzo email",
          greeting: `Benvenuto su Reputia, ${user.name}!`,
          body: "conferma il tuo indirizzo email per attivare l'account e iniziare a gestire le tue recensioni.",
          cta: "Conferma email",
          url,
          footer: "Il link scade tra 24 ore. Se non hai creato tu l'account, ignora questa email.",
        }),
      );
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: isProduction,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 300, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
      "/send-verification-email": { window: 300, max: 3 },
    },
  },
  advanced: {
    useSecureCookies: isProduction,
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
  },
  plugins: [
    organization({
      creatorRole: "owner",
      organizationLimit: 5,
      sendInvitationEmail: async ({ email, organization: org, inviter, id }) => {
        await sendEmail(
          actionEmail({
            to: email,
            subject: `${inviter.user.name} ti ha invitato su Reputia`,
            greeting: "Ciao,",
            body: `${inviter.user.name} ti ha invitato a collaborare alla gestione delle recensioni di ${org.name}.`,
            cta: "Accetta l'invito",
            url: `${env.APP_URL}/invito/${id}`,
            footer: "Se non conosci il mittente, puoi ignorare questa email.",
          }),
        );
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
