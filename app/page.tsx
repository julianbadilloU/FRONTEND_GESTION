import Link from "next/link";

import { SectionCard } from "@/components/project/section-card";
import { env } from "@/config/env";
import { adminRoutes, adoptanteRoutes, albergueRoutes, authRoutes } from "@/config/navigation";
import {
  documentationSources,
  folderBlueprint,
  moduleCatalog,
  priorityGaps,
  projectStack,
} from "@/config/project-catalog";

const roleRoutes = [
  {
    title: "Autenticacion",
    items: authRoutes,
  },
  {
    title: "Adoptante",
    items: adoptanteRoutes,
  },
  {
    title: "Albergue",
    items: albergueRoutes,
  },
  {
    title: "Admin",
    items: adminRoutes,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <main className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[36px] border border-border/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,244,230,0.95))] px-6 py-8 shadow-[var(--shadow-soft)] sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand">Frontend Workspace</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                FurMatch quedo preparado para que el equipo frontend arranque por modulos.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                Revise la documentacion funcional de la carpeta raiz, cruce los mockups con las historias de usuario y deje una base modular en Next.js con cliente HTTP, entorno, rutas semilla y dependencias para formularios, cache y validacion.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-border bg-white px-4 py-2 text-foreground">
                  Frontend: {env.NEXT_PUBLIC_APP_URL}
                </span>
                <span className="rounded-full border border-border bg-white px-4 py-2 text-foreground">
                  Backend esperado: {env.NEXT_PUBLIC_API_URL}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong" href="/login">
                  Ver auth base
                </Link>
                <Link
                  className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                  href="/adoptante"
                >
                  Ver workspaces
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-border/80 bg-white/80 px-5 py-5">
                <p className="text-sm font-semibold text-foreground">Stack base instalado</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {projectStack.map((item) => (
                    <span key={item} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-border/80 bg-white/80 px-5 py-5">
                <p className="text-sm font-semibold text-foreground">Base funcional cubierta</p>
                <ul className="mt-4 grid gap-3 text-sm text-muted">
                  <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">Puerto del frontend movido a `3001` para convivir con Express en `3000`.</li>
                  <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">Rutas semilla creadas para auth y overview por rol.</li>
                  <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">Documentacion interna agregada en `docs/frontend-setup.md`.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SectionCard title="Documentacion revisada" description="Archivos usados como fuente de verdad para dejar la base del frontend lista.">
            <ul className="grid gap-3 text-sm text-muted">
              {documentationSources.map((source) => (
                <li key={source.name} className="rounded-2xl border border-border/80 bg-background px-4 py-3">
                  <span className="block font-mono text-xs text-foreground">{source.name}</span>
                  <span className="mt-2 block leading-6">{source.description}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Estructura creada" description="Carpetas y responsabilidades dejadas listas para repartir trabajo en paralelo.">
            <ul className="grid gap-3 text-sm text-muted">
              {folderBlueprint.map((item) => (
                <li key={item.title} className="rounded-2xl border border-border/80 bg-background px-4 py-3">
                  <span className="block font-mono text-xs text-foreground">{item.title}</span>
                  <span className="mt-2 block leading-6">{item.description}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="Mapa de modulos" description="Modulos detectados en las HU y rutas sugeridas para que cada subequipo tome ownership.">
          <div className="grid gap-4 lg:grid-cols-2">
            {moduleCatalog.map((moduleItem) => (
              <article key={moduleItem.id} className="rounded-[28px] border border-border/80 bg-background px-5 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                    {moduleItem.owner}
                  </span>
                  <span className="text-xs font-medium text-muted">{moduleItem.source}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{moduleItem.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{moduleItem.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {moduleItem.futureRoutes.map((route) => (
                    <span key={route} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                      {route}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <SectionCard title="Rutas sembradas" description="Puntos de entrada ya disponibles para el equipo.">
            <div className="grid gap-4 md:grid-cols-2">
              {roleRoutes.map((group) => (
                <div key={group.title} className="rounded-[28px] border border-border/80 bg-background px-5 py-5">
                  <h2 className="text-lg font-semibold text-foreground">{group.title}</h2>
                  <div className="mt-4 grid gap-3">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href} className="rounded-2xl border border-border/80 bg-white px-4 py-3 transition hover:border-brand">
                        <span className="block font-medium text-foreground">{item.label}</span>
                        <span className="mt-1 block text-sm text-muted">{item.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Gaps prioritarios" description="Pendientes visuales ya identificados para que no bloqueen el desarrollo.">
            <ul className="grid gap-3 text-sm text-muted">
              {priorityGaps.map((item) => (
                <li key={item.title} className="rounded-2xl border border-border/80 bg-background px-4 py-3">
                  <span className="font-medium text-foreground">{item.title}:</span> {item.detail}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
