import Link from "next/link";

import { SectionCard } from "@/components/project/section-card";
import type { NavigationItem } from "@/types/navigation";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  hu: string[];
  mockups: string[];
  folders: string[];
  checklist: string[];
  relatedRoutes?: NavigationItem[];
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  hu,
  mockups,
  folders,
  checklist,
  relatedRoutes = [],
}: PlaceholderPageProps) {
  return (
    <main className="grid gap-6">
      <SectionCard title={title} description={description}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <div className="rounded-2xl border border-border/80 bg-background px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">{eyebrow}</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Esta ruta ya quedo sembrada para que el equipo reemplace el placeholder por la implementacion real sin rehacer estructura ni configuracion base.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {hu.map((item) => (
                <span key={item} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background px-5 py-4 text-sm text-muted">
            <p className="font-semibold text-foreground">Checklist de arranque</p>
            <ul className="mt-3 grid gap-2">
              {checklist.map((item) => (
                <li key={item} className="rounded-2xl border border-border/70 bg-white px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Mockups base" description="Referencias tomadas de la documentacion revisada en la carpeta raiz del proyecto.">
          <ul className="grid gap-2 text-sm text-muted">
            {mockups.map((item) => (
              <li key={item} className="rounded-2xl border border-border/80 bg-background px-4 py-3 font-mono text-xs text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Carpetas sugeridas" description="Ubicaciones recomendadas para mantener el codigo organizado por dominio.">
          <ul className="grid gap-2 text-sm text-muted">
            {folders.map((item) => (
              <li key={item} className="rounded-2xl border border-border/80 bg-background px-4 py-3 font-mono text-xs text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {relatedRoutes.length ? (
        <SectionCard title="Rutas relacionadas" description="Accesos ya sembrados para continuar el flujo funcional.">
          <div className="grid gap-3 md:grid-cols-2">
            {relatedRoutes.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-border/80 bg-background px-4 py-3 transition hover:border-brand"
              >
                <span className="block font-medium text-foreground">{item.label}</span>
                <span className="mt-1 block text-sm text-muted">{item.description}</span>
              </Link>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </main>
  );
}
