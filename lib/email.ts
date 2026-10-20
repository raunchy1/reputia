import nodemailer, { type Transporter } from "nodemailer";
import { env, isProduction } from "@/lib/env";

export type EmailMessage = { to: string; subject: string; text: string; html: string };

let transport: Transporter | undefined;

export async function sendEmail(message: EmailMessage) {
  if (!env.SMTP_URL) {
    // Without SMTP, development prints the message so links can be opened by hand.
    // Production must never silently drop verification or reset emails.
    if (isProduction) throw new Error("SMTP_URL non configurato: impossibile inviare email");
    console.info(`[email] a ${message.to} — ${message.subject}\n${message.text}`);
    return;
  }
  transport ??= nodemailer.createTransport(env.SMTP_URL);
  await transport.sendMail({ from: env.EMAIL_FROM, ...message });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function actionEmail(opts: { to: string; subject: string; greeting: string; body: string; cta: string; url: string; footer: string }): EmailMessage {
  const text = `${opts.greeting}\n\n${opts.body}\n\n${opts.cta}: ${opts.url}\n\n${opts.footer}\n\n— Reputia`;
  const html = `<!doctype html><html lang="it"><body style="margin:0;background:#f6f4ef;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#141b2d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;padding:36px" cellpadding="0" cellspacing="0">
<tr><td style="font-size:20px;font-weight:700;letter-spacing:-0.02em;padding-bottom:24px">Reputia</td></tr>
<tr><td style="font-size:16px;line-height:1.6;padding-bottom:12px">${escapeHtml(opts.greeting)}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#4a5268;padding-bottom:28px">${escapeHtml(opts.body)}</td></tr>
<tr><td><a href="${escapeHtml(opts.url)}" style="display:inline-block;background:#141b2d;color:#ffffff;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:10px">${escapeHtml(opts.cta)}</a></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#7a8196;padding-top:28px">${escapeHtml(opts.footer)}</td></tr>
</table></td></tr></table></body></html>`;
  return { to: opts.to, subject: opts.subject, text, html };
}
