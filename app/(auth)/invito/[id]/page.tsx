import type { Metadata } from "next";
import Link from "next/link";
import { AcceptInvitation } from "@/components/auth/accept-invitation";
import { buttonClass } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Invito" };

export default async function InvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invitation = await db.invitation.findUnique({ where: { id }, include: { organization: { select: { name: true } } } });
  const session = await getSession();
  const valid = invitation && invitation.status === "pending" && invitation.expiresAt > new Date();

  if (!valid) {
    return (
      <>
        <h1 className="display text-4xl">Invito non valido</h1>
        <p className="mt-3 text-muted">L&apos;invito è scaduto o è già stato usato. Chiedi a chi ti ha invitato di inviarne uno nuovo.</p>
      </>
    );
  }
  const next = encodeURIComponent(`/invito/${id}`);
  return (
    <>
      <h1 className="display text-4xl">Unisciti a {invitation.organization.name}</h1>
      <p className="mt-3 text-muted">
        Sei stato invitato a gestire le recensioni su Reputia con l&apos;indirizzo <strong className="font-medium text-ink">{invitation.email}</strong>.
      </p>
      {session ? (
        session.user.email.toLowerCase() === invitation.email.toLowerCase() ? (
          <AcceptInvitation invitationId={id} />
        ) : (
          <p className="mt-6 text-sm text-danger">Hai effettuato l&apos;accesso come {session.user.email}. Accedi con l&apos;indirizzo dell&apos;invito per accettarlo.</p>
        )
      ) : (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/registrati?next=${next}`} className={buttonClass("primary", "lg")}>
            Crea il tuo account
          </Link>
          <Link href={`/accedi?next=${next}`} className={buttonClass("secondary", "lg")}>
            Ho già un account
          </Link>
        </div>
      )}
    </>
  );
}
