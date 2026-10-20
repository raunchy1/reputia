import { Logo } from "@/components/ui/logo";
import { Stars } from "@/components/ui/stars";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12 animate-rise">{children}</main>
        <p className="text-xs text-faint">© {new Date().getFullYear()} Reputia · Fatto in Italia</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-ink lg:block" aria-hidden>
        <div className="relative flex h-full flex-col justify-center gap-5 px-14">
          <p className="display max-w-md text-[40px] leading-[1.08] text-white">Ogni recensione merita una risposta all&apos;altezza della tua attività.</p>
          <div className="mt-6 max-w-md rounded-[10px] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Francesca M.</span>
              <Stars rating={5} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">Cena splendida, il risotto ai funghi era perfetto. Personale attento e simpatico.</p>
          </div>
          <div className="ml-10 max-w-md rounded-[10px] border border-white/10 bg-white/[0.06] p-5">
            <span className="text-xs font-medium text-white/60">Bozza dell&apos;assistente · da approvare</span>
            <p className="mt-2 text-sm leading-relaxed text-white/90">Grazie Francesca! Il risotto è uno dei piatti a cui teniamo di più: siamo felici che l&apos;abbia apprezzato. A presto!</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
