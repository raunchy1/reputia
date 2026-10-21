import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Steps } from "@/components/onboarding/steps";
import { ReplyComposer } from "@/components/reviews/reply-composer";
import { ButtonLink } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/session";

export const metadata: Metadata = { title: "La prima risposta" };

export default async function OnboardingFirstReply() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding/attivita");
  // A real imported review: prefer one with text that still needs an answer, critical ones first.
  const review = await db.review.findFirst({
    where: { organizationId: ctx.organization.id, comment: { not: null }, status: { in: ["NEW", "DRAFT"] } },
    orderBy: [{ rating: "asc" }, { reviewedAt: "desc" }],
    include: { location: { include: { connection: { select: { provider: true, status: true } } } } },
  });
  if (!review) redirect("/onboarding/fine");
  return (
    <>
      <Steps current={4} />
      <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Prova l&apos;assistente</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Ecco una delle tue recensioni{review.source === "MOCK" ? " di esempio" : ""}. Premi «Genera risposta» e guarda la bozza: puoi modificarla, salvarla o pubblicarla più tardi.
      </p>
      <div className="mt-8 rounded-[var(--radius-panel)] border border-line bg-surface px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold">{review.authorName}</span>
          <Stars rating={review.rating} />
        </div>
        <p className="mt-1.5 text-[15px] leading-relaxed">{review.comment}</p>
      </div>
      <div className="mt-4">
        <ReplyComposer
          reviewId={review.id}
          authorName={review.authorName}
          status={review.status}
          savedText={review.replyText ?? ""}
          defaultTone={review.location.tone}
          defaultLength={review.location.replyLength}
          canPublish={false}
          connection={review.location.connection ? { simulated: review.location.connection.provider === "MOCK", active: review.location.connection.status === "ACTIVE" } : null}
          hadError={false}
          provenance={null}
          compact
        />
      </div>
      <ButtonLink href="/onboarding/fine" size="lg" className="mt-8">
        Continua <ArrowRight aria-hidden />
      </ButtonLink>
    </>
  );
}
