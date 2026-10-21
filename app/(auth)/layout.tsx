import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="flex flex-col px-5 py-7 sm:px-10">
        <header>
          <Logo />
        </header>
        <main className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-12 animate-rise">{children}</main>
        <footer className="font-mono text-[11px] text-faint">© {new Date().getFullYear()} Reputia</footer>
      </div>
      <aside className="relative hidden overflow-hidden bg-night lg:flex lg:flex-col lg:justify-between lg:p-14" aria-hidden>
        <div className="pointer-events-none absolute right-[-160px] bottom-[-160px] size-[520px] rounded-full bg-gold/[0.10] blur-[110px]" />
        <span />
        <div className="relative">
          <p className="max-w-[12ch] text-[56px] leading-[0.95] font-semibold tracking-[-0.055em] text-white">
            Mettiamoci un punto<span className="ml-[0.04em] inline-block size-[0.15em] rounded-full bg-gold-bright align-baseline" />
          </p>
          <p className="mt-6 max-w-[34ch] text-[15px] leading-relaxed text-white/55">Le risposte alle tue recensioni Google, scritte con cura e approvate da te.</p>
        </div>
        <p className="relative font-mono text-[11px] text-white/55">reputia.websardegna.xyz</p>
      </aside>
    </div>
  );
}
