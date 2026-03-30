import { RoleShell } from "@/components/layout/role-shell";
import { SectionCard } from "@/components/project/section-card";
import { adminRoutes } from "@/config/navigation";
import { moduleCatalog } from "@/config/project-catalog";

const adminModules = moduleCatalog.filter((moduleItem) => moduleItem.owner === "Admin");

export default function AdminPage() {
  return (
    <RoleShell
      title="Workspace Admin"
      description="Base preparada para cuentas, tags, mascotas publicadas, configuracion y dashboard del administrador."
      featureFolder="features/admin"
      navigation={adminRoutes}
    >
      <SectionCard title="Modulos priorizados" description="Vistas administrativas y configuraciones transversales del MVP.">
        <div className="grid gap-4 lg:grid-cols-2">
          {adminModules.map((moduleItem) => (
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

      <SectionCard title="Notas de integracion" description="Puntos a mantener estables para el resto del equipo.">
        <ul className="grid gap-3 text-sm text-muted">
          <li className="rounded-2xl border border-border/80 bg-background px-4 py-3">Reservar tablas, filtros y exportaciones dentro de `features/admin` para no mezclar UI con logica de reportes.</li>
          <li className="rounded-2xl border border-border/80 bg-background px-4 py-3">Mantener enums y labels de estado alineados con backend y base de datos antes de cerrar formularios.</li>
          <li className="rounded-2xl border border-border/80 bg-background px-4 py-3">Usar layouts compartidos para navbar admin y badges globales de notificaciones.</li>
        </ul>
      </SectionCard>
    </RoleShell>
  );
}
