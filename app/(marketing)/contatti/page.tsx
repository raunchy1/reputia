import { CalendarDays, Mail, Video } from "lucide-react";
import type { Metadata } from "next";
import { LeadForm } from "@/components/marketing/lead-form";
import { buttonClass } from "@/components/ui/button";
import { DEMO_BOOKING_URL, LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Prenota una demo", description: "Una videochiamata di 15 minuti per vedere Reputia sulle recensioni della tua attività." };

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:py-28">
      <div>
        <p className="eyebrow">Contatti</p>
        <h1 className="display mt-4 text-5xl">Prenota una demo di 15 minuti</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">Ti mostriamo Reputia sulle recensioni della tua attività e rispondiamo a tutte le tue domande. Nessun impegno.</p>
        <ul className="mt-10 grid gap-5 text-[15px]">
          <li className="flex gap-3">
            <Video className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.7} aria-hidden /> Videochiamata su Google Meet, dal computer o dal telefono.
          </li>
          <li className="flex gap-3">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.7} aria-hidden /> Scegli tu giorno e orario.
          </li>
          {LEGAL.email && (
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.7} aria-hidden />
              <a href={`mailto:${LEGAL.email}`} className="underline underline-offset-2">
                {LEGAL.email}
              </a>
            </li>
          )}
        </ul>
        {DEMO_BOOKING_URL && (
          <a href={DEMO_BOOKING_URL} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg", "mt-10")}>
            Scegli subito un orario
          </a>
        )}
      </div>
      <div className="card p-6 sm:p-9">
        <h2 className="font-semibold">{DEMO_BOOKING_URL ? "Preferisci essere ricontattato?" : "Lasciaci i tuoi dati"}</h2>
        <p className="mt-1 mb-7 text-sm text-muted">Ti scriviamo entro un giorno lavorativo per fissare l&apos;appuntamento.</p>
        <LeadForm />
      </div>
    </section>
  );
}
