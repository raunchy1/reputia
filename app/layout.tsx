import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Reputia — Gestione recensioni AI", description: "Gestisci le recensioni Google con risposte assistite dall’intelligenza artificiale." };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {return <html lang="it"><body>{children}</body></html>;}
