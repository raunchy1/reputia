import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = { title: "Abbonamento" };

export default function BillingPage() {
  return (
    <>
      <PageHeader eyebrow="Abbonamento" title="Piano e fatturazione" />
      <Notice>La gestione dell&apos;abbonamento sarà disponibile a breve.</Notice>
    </>
  );
}
