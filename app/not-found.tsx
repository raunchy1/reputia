import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="text-center">
        <Logo />
        <p className="display mt-10 text-7xl text-line-strong">404</p>
        <h1 className="display mt-2 text-3xl">Pagina non trovata</h1>
        <p className="mt-3 text-muted">La pagina che cerchi non esiste o è stata spostata.</p>
        <ButtonLink href="/" className="mt-8">
          Torna alla home
        </ButtonLink>
      </div>
    </main>
  );
}
