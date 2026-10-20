import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz", "SOFT"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "Reputia — Rispondi alle recensioni Google con l'AI", template: "%s · Reputia" },
  description:
    "Reputia aiuta ristoranti, hotel, B&B e attività locali italiane a rispondere alle recensioni Google in pochi secondi, con risposte professionali scritte dall'intelligenza artificiale e approvate da te.",
  openGraph: { type: "website", locale: "it_IT", siteName: "Reputia" },
};

export const viewport: Viewport = { themeColor: "#f6f4ef" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${geist.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
