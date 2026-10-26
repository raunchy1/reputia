import type { Metadata } from "next";
import { Controller, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Informativa privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Informativa privacy" updated="20 ottobre 2026">
      <p>Questa informativa spiega come Reputia tratta i dati personali, ai sensi del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003.</p>
      <Controller />
      <h2>Quali dati trattiamo</h2>
      <ul>
        <li>Dati dell&apos;account: nome, email, password (conservata solo in forma cifrata con hash), ruolo nel team.</li>
        <li>Dati dell&apos;attività: nome, categoria, città, impostazioni di tono e testi che inserisci.</li>
        <li>Dati provenienti da Google Business Profile, se colleghi la tua scheda: recensioni, nome pubblico e foto profilo dei recensori, risposte.</li>
        <li>Dati delle richieste di contatto: nome, attività, email, telefono e messaggio.</li>
        <li>Dati tecnici: indirizzo IP e user agent per sicurezza, prevenzione degli abusi e registro delle operazioni sensibili.</li>
        <li>Dati di fatturazione, gestiti da Stripe: Reputia non memorizza i numeri delle carte di pagamento.</li>
      </ul>
      <h2>Finalità e basi giuridiche</h2>
      <ul>
        <li>Fornire il servizio richiesto (art. 6.1.b GDPR): gestione dell&apos;account, importazione delle recensioni, generazione delle bozze, pubblicazione su tua approvazione.</li>
        <li>Rispondere alle richieste di demo e informazioni (art. 6.1.b e 6.1.a GDPR).</li>
        <li>Inviare novità su Reputia solo se hai dato il consenso facoltativo (art. 6.1.a GDPR), revocabile in ogni momento.</li>
        <li>Sicurezza del servizio e prevenzione delle frodi (art. 6.1.f GDPR).</li>
        <li>Adempimenti fiscali e contabili (art. 6.1.c GDPR).</li>
      </ul>
      <h2>Intelligenza artificiale</h2>
      <p>
        Per generare le bozze inviamo al fornitore del modello di intelligenza artificiale il testo della recensione, il nome pubblico del recensore e le informazioni
        sull&apos;attività che hai inserito. Il fornitore agisce come responsabile del trattamento. Nessuna risposta viene pubblicata senza l&apos;approvazione di una persona.
      </p>
      <h2>Destinatari</h2>
      <p>I dati sono trattati da fornitori che agiscono come responsabili del trattamento, vincolati da accordi conformi all&apos;art. 28 GDPR:</p>
      <ul>
        <li>fornitore di hosting e infrastruttura server;</li>
        <li>DeepSeek, con sede in Cina, per la generazione delle bozze di risposta;</li>
        <li>Google, per la lettura delle recensioni e la pubblicazione delle risposte tramite Google Business Profile;</li>
        <li>Stripe, per i pagamenti e la fatturazione;</li>
        <li>fornitore del servizio di invio email.</li>
      </ul>
      <p>
        Alcuni fornitori possono trattare dati al di fuori dello Spazio economico europeo: in tal caso il trasferimento avviene sulla base di decisioni di adeguatezza o
        delle clausole contrattuali standard della Commissione europea. Per la Cina, dove opera DeepSeek, non esiste una decisione di adeguatezza: il trasferimento
        avviene sulla base delle clausole contrattuali standard e riguarda solo i dati necessari a generare la bozza.
      </p>
      <h2>Conservazione</h2>
      <ul>
        <li>Dati dell&apos;account e dell&apos;attività: per la durata del rapporto e fino a 12 mesi dopo la chiusura dell&apos;account.</li>
        <li>Richieste di contatto non seguite da un contratto: 12 mesi.</li>
        <li>Documenti fiscali: 10 anni, come previsto dalla legge.</li>
        <li>Registri di sicurezza: 12 mesi.</li>
      </ul>
      <h2>I tuoi diritti</h2>
      <p>
        Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporti al trattamento (artt. 15-22 GDPR), scrivendo al titolare. Hai inoltre diritto
        di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).
      </p>
    </LegalPage>
  );
}
