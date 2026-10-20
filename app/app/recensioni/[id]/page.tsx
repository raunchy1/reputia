import { redirect } from "next/navigation";

// Old deep links (emails, dashboard) open the review inside the inbox.
export default async function ReviewRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/recensioni?stato=tutte&r=${encodeURIComponent(id)}`);
}
