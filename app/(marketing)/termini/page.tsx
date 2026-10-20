import type { Metadata } from "next";
import { Controller, LegalPage } from "@/components/marketing/legal-page";
import { formatEur, PLAN } from "@/lib/plans";

export const metadata: Metadata = { title: "Termini di servizio" };

export default function TermsPage() {
  return (
    <LegalPage title="Termini di servizio" updated="20 ottobre 2026">
      <p>
        Questi termini regolano l&apos;uso di Reputia, servizio in abbonamento rivolto a professionisti e imprese (B2B) per la gestione delle recensioni online. Creando
        un account dichiari di agire nell&apos;ambito della tua attività imprenditoriale o professionale.
      </p>
      <Controller />
      <h2>1. Il servizio</h2>
      <p>
        Reputia importa le recensioni dalle schede Google Business Profile che colleghi, propone bozze di risposta generate dall&apos;intelligenza artificiale e, su tua
        esplicita approvazione, pubblica le risposte su Google. La disponibilità dell&apos;integrazione dipende dalle API e dalle politiche di Google.
      </p>
      <h2>2. Responsabilità sui contenuti</h2>
      <p>
        Le bozze generate dall&apos;AI sono proposte. Sei tu a decidere se pubblicarle e resti responsabile dei contenuti pubblicati a nome della tua attività. Ti
        chiediamo di rileggere ogni risposta prima della pubblicazione.
      </p>
      <h2>3. Prova gratuita e abbonamento</h2>
      <p>
        La prova gratuita dura {PLAN.trialDays} giorni. Al termine, per continuare a usare il servizio è necessario attivare l&apos;abbonamento {PLAN.name}, al prezzo
        indicato nella pagina Prezzi (attualmente {formatEur(PLAN.monthlyPriceEur)} al mese per sede, IVA esclusa). L&apos;abbonamento si rinnova ogni mese e il
        pagamento avviene tramite Stripe.
      </p>
      <h2>4. Disdetta</h2>
      <p>
        Puoi disdire in qualsiasi momento dalla pagina Abbonamento. La disdetta ha effetto alla fine del periodo già pagato e non dà diritto a rimborsi per il periodo in
        corso.
      </p>
      <h2>5. Uso corretto</h2>
      <p>
        È vietato usare Reputia per pubblicare contenuti illeciti, ingannevoli o contrari alle norme di Google, per gestire schede che non hai il diritto di amministrare
        o per tentare di aggirare i limiti tecnici del servizio.
      </p>
      <h2>6. Limitazione di responsabilità</h2>
      <p>
        Il servizio è fornito con la massima diligenza ma senza garanzia di disponibilità ininterrotta. Nei limiti consentiti dalla legge, la responsabilità di Reputia è
        limitata all&apos;importo pagato negli ultimi 12 mesi, salvo dolo o colpa grave.
      </p>
      <h2>7. Legge applicabile</h2>
      <p>Questi termini sono regolati dalla legge italiana. Per ogni controversia è competente il foro della sede del titolare.</p>
    </LegalPage>
  );
}
