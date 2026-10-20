import { Logo } from "@/components/ui/logo";
import { requireUser } from "@/lib/session";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo href="/app" />
      </header>
      <main className="mx-auto max-w-xl px-5 pt-6 pb-20 sm:px-8 animate-rise">{children}</main>
    </div>
  );
}
