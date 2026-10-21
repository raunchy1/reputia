import type { Metadata, Viewport } from "next";
import { Host_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sans = Host_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-host", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "Reputia — Ogni recensione merita la risposta giusta.", template: "%s · Reputia" },
  description:
    "Reputia aiuta ristoranti, hotel, B&B e attività locali italiane a rispondere alle recensioni Google in pochi secondi, con risposte professionali scritte dall'intelligenza artificiale e approvate da te.",
  openGraph: { type: "website", locale: "it_IT", siteName: "Reputia" },
};

export const viewport: Viewport = { themeColor: "#0e1116" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
