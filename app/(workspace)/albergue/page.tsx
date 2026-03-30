import { RoleShell } from "@/components/layout/role-shell";
import { SectionCard } from "@/components/project/section-card";
import { albergueRoutes } from "@/config/navigation";
import { moduleCatalog } from "@/config/project-catalog";

const albergueModules = moduleCatalog.filter((moduleItem) => moduleItem.owner === "Albergue");

export default function AlberguePage() {
  return (
    <RoleShell
      title="Workspace Albergue"
      description="Base preparada para perfil institucional, gestion de mascotas, candidatos, historial y reportes."
      featureFolder="features/albergue"
      navigation={albergueRoutes}
    >
      <SectionCard title="Modulos priorizados" description="Capas sugeridas para arrancar desarrollo por dominio.">
        <div className="grid gap-4 lg:grid-cols-2">
          {albergueModules.map((moduleItem) => (
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

      <SectionCard title="Criterios de arranque" description="Convenciones minimas para trabajar sin bloquear a otros frentes.">
        <ul className="grid gap-3 text-sm text-muted">
          <li className="rounded-2xl border border-border/80 bg-background px-4 py-3">Modelar formularios con `react-hook-form` + `zod` antes de conectar APIs.</li>
          <li className="rounded-2xl border border-border/80 bg-background px-4 py-3">Mantener peticiones y DTOs dentro de `features/albergue` para evitar acoplar pantallas distintas.</li>
          <li className="rounded-2xl border border-border/80 bg-background px-4 py-3">Usar `apiClient` compartido para heredar timeout, baseURL e inyeccion de token.</li>
        </ul>
      </SectionCard>
    </RoleShell>
  );
}
