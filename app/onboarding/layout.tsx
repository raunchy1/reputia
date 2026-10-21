import { Logo } from "@/components/ui/logo";
import { Toaster } from "@/components/ui/toaster";
import { requireUser } from "@/lib/session";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo href="/app" className="text-base" />
      </header>
      <main className="mx-auto max-w-[560px] px-5 pt-4 pb-20 sm:px-8">
        <div className="animate-rise">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
