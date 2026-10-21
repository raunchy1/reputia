"use client";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { syncAction } from "@/app/app/recensioni/actions";
import { cn } from "@/lib/cn";

export function SyncButton({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = () =>
    start(async () => {
      const res = await syncAction();
      if (res?.ok) {
        toast.success(res.message ?? "Sincronizzato.");
        router.refresh();
      } else if (res) toast.error(res.error);
    });
  const icon = <RefreshCw className={cn(pending && "animate-spin")} aria-hidden />;
  if (compact)
    return (
      <TooltipProvider>
        <Tooltip label="Sincronizza da Google" side="bottom">
          <Button type="button" variant="ghost" size="icon" onClick={run} disabled={pending} aria-label="Sincronizza da Google">
            {icon}
          </Button>
        </Tooltip>
      </TooltipProvider>
    );
  return (
    <Button type="button" variant="secondary" onClick={run} disabled={pending}>
      {icon}
      {pending ? "Sincronizzazione…" : "Sincronizza"}
    </Button>
  );
}
