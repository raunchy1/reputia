import type { Metadata } from "next";
import { Controller, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Cookie policy" };

export default function CookiePage() {
  return (
    <LegalPage title="Cookie policy" updated="20 ottobre 2026">
      <Controller />
      <p>
        Reputia utilizza esclusivamente <strong>cookie tecnici</strong>, necessari al funzionamento del servizio. Non usiamo cookie di profilazione, di marketing o di
        analisi statistica di terze parti. Per questo, in base alle Linee guida del Garante privacy del 10 giugno 2021, non è richiesto il tuo consenso e non mostriamo un
        banner.
      </p>
      <h2>Cookie utilizzati</h2>
      <ul>
        <li>
          <strong>Sessione</strong> (better-auth.session_token e simili): mantiene l&apos;accesso al tuo account. Durata: fino a 14 giorni o fino all&apos;uscita.
        </li>
        <li>
          <strong>Collegamento Google</strong> (g_oauth_nonce, g_oauth_from): protegge la procedura di autorizzazione con Google. Durata: 10 minuti.
        </li>
      </ul>
      <p>Se in futuro introdurremo strumenti di analisi o cookie non tecnici, aggiorneremo questa pagina e chiederemo il tuo consenso prima di attivarli.</p>
      <p>Puoi cancellare i cookie in qualsiasi momento dalle impostazioni del browser; senza il cookie di sessione non è possibile accedere all&apos;area riservata.</p>
    </LegalPage>
  );
}
