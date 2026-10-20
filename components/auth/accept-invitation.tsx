"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function AcceptInvitation({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <div className="mt-8 grid gap-4">
      {error && <Notice tone="danger">{error}</Notice>}
      <Button
        size="lg"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const { data, error } = await authClient.organization.acceptInvitation({ invitationId });
          if (error || !data) {
            setPending(false);
            return setError(authErrorMessage(error));
          }
          await authClient.organization.setActive({ organizationId: data.invitation.organizationId });
          router.push("/app");
          router.refresh();
        }}
      >
        {pending ? "Un momento…" : "Accetta l'invito"}
      </Button>
    </div>
  );
}
