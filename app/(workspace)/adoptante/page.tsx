import { RoleShell } from "@/components/layout/role-shell";
import { SectionCard } from "@/components/project/section-card";
import { adoptanteRoutes } from "@/config/navigation";
import { moduleCatalog, priorityGaps } from "@/config/project-catalog";

const adoptanteModules = moduleCatalog.filter((moduleItem) => moduleItem.owner === "Adoptante");
const adoptanteGaps = priorityGaps.filter((gap) => gap.owners.includes("Adoptante"));

export default function AdoptantePage() {
  return (
    <RoleShell
      title="Workspace Adoptante"
      description="Base preparada para onboarding, feed, perfil, matches y notificaciones del rol adoptante."
      featureFolder="features/adoptante"
      navigation={adoptanteRoutes}
    >
      <SectionCard title="Modulos priorizados" description="Tareas derivadas de la documentacion funcional revisada.">
        <div className="grid gap-4 lg:grid-cols-2">
          {adoptanteModules.map((moduleItem) => (
            <article key={moduleItem.id} className="rounded-2xl border border-border/80 bg-background px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">{moduleItem.source}</p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">{moduleItem.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{moduleItem.summary}</p>
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

      <SectionCard title="Gaps visuales a cubrir" description="Estados faltantes detectados en la validacion de mockups.">
        <ul className="grid gap-3 text-sm text-muted">
          {adoptanteGaps.map((gap) => (
            <li key={gap.title} className="rounded-2xl border border-border/80 bg-background px-4 py-3">
              <span className="font-medium text-foreground">{gap.title}:</span> {gap.detail}
            </li>
          ))}
        </ul>
      </SectionCard>
    </RoleShell>
  );
}
