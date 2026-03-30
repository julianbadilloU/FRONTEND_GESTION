import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-white/90 px-6 py-5 shadow-[var(--shadow-soft)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">
              FurMatch Frontend
            </Link>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Auth base lista para trabajar sobre las historias HU-AUTH-01 a HU-AUTH-05.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm">
            <Link className="rounded-full border border-border px-4 py-2 text-foreground transition hover:border-brand hover:text-brand" href="/registro">
              Registro
            </Link>
            <Link className="rounded-full border border-border px-4 py-2 text-foreground transition hover:border-brand hover:text-brand" href="/login">
              Login
            </Link>
            <Link
              className="rounded-full border border-border px-4 py-2 text-foreground transition hover:border-brand hover:text-brand"
              href="/recuperar-contrasena"
            >
              Recuperar acceso
            </Link>
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
