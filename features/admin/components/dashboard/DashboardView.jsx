"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart2, Loader2, Users, Home, PawPrint, Heart } from "lucide-react";
import { getEstadisticas } from "@/features/admin/services/adminStats.service";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-3 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">{label}</p>
      <p className="text-4xl font-bold text-gray-900">{value ?? "—"}</p>
      {sub !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Completitud de perfil</span>
            <span>{sub}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8b9e7e] rounded-full transition-all"
              style={{ width: `${Math.min(100, sub || 0)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const MASCOTA_ESTADOS = [
  { key: "disponible", label: "Disponible", color: "bg-emerald-400" },
  { key: "en_proceso", label: "En proceso", color: "bg-blue-400" },
  { key: "adoptado", label: "Adoptado", color: "bg-[#8b9e7e]" },
  { key: "archivado", label: "Archivado", color: "bg-gray-300" },
];

function DonutLegend({ stats }) {
  const mascotas = stats?.mascotas ?? {};
  const total = mascotas.total ?? 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Mascotas por estado</p>
      <p className="text-5xl font-bold text-gray-900 mb-6">{total}</p>
      <p className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-widest">Total publicadas</p>
      <div className="space-y-3">
        {MASCOTA_ESTADOS.map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {mascotas[key] ?? mascotas.por_estado?.[key] ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const MAX_HEIGHT = 120;
  const max = Math.max(...data.map((d) => d.total ?? 0), 1);

  return (
    <div className="flex items-end gap-3 h-[160px]">
      {data.map((item, i) => {
        const height = Math.round(((item.total ?? 0) / max) * MAX_HEIGHT);
        const label =
          item.mes
            ? MONTH_LABELS[(parseInt(item.mes.split("-")[1], 10) - 1) % 12]
            : `M${i + 1}`;

        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs font-bold text-gray-700">{item.total ?? 0}</span>
            <div
              className="w-full bg-[#8b9e7e] rounded-t-lg transition-all"
              style={{ height: `${height}px`, minHeight: height > 0 ? "4px" : "0" }}
            />
            <span className="text-[10px] text-gray-400 font-semibold">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardView() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getEstadisticas,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#8b9e7e]" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-24 bg-rose-50 border border-rose-100 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
        <p className="text-rose-900 font-bold text-lg">Error al cargar estadísticas</p>
        <p className="text-rose-700 text-sm">{error.message}</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-stats"] })}
          className="text-rose-600 text-xs font-bold uppercase tracking-widest hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const usuarios = stats?.usuarios ?? {};
  const mascotas = stats?.mascotas ?? {};
  const matching = stats?.matching ?? {};
  const adopcionesPorMes = stats?.adopciones_por_mes ?? matching?.adopciones_por_mes ?? [];
  const topAlbergues = stats?.top_albergues ?? matching?.top_albergues ?? [];

  const tasa = usuarios.tasa_completitud_perfil ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 text-[#8b9e7e] mb-1">
          <BarChart2 size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Administración</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-serif italic">
          Dashboard de Estadísticas
        </h1>
        <p className="text-gray-500 text-sm">Resumen global de la plataforma FurMatch.</p>
      </div>

      {/* Section 1 — Usuarios y Crecimiento */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Users size={16} strokeWidth={2.5} />
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500">
            Usuarios y Crecimiento
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total adoptantes" value={usuarios.total_adoptantes} />
          <KpiCard label="Adoptantes activos" value={usuarios.adoptantes_activos} />
          <KpiCard label="Adoptantes inactivos" value={usuarios.adoptantes_inactivos} />
          <KpiCard label="Total albergues" value={usuarios.total_albergues} />
          <KpiCard label="Albergues activos" value={usuarios.albergues_activos} />
          <KpiCard label="Completitud perfil" value={`${tasa}%`} sub={tasa} />
        </div>
      </section>

      {/* Section 2 — Mascotas */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <PawPrint size={16} strokeWidth={2.5} />
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500">Mascotas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <DonutLegend stats={stats} />
        </div>
      </section>

      {/* Section 3 — Matching y Adopciones */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Heart size={16} strokeWidth={2.5} />
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500">
            Matching y Adopciones
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-sm mb-6">
          <KpiCard label="Total matches" value={matching.total_matches} />
          <KpiCard label="Total adopciones" value={matching.total_adopciones} />
        </div>

        {adopcionesPorMes.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-6">
              Adopciones por mes (últimos 6 meses)
            </p>
            <BarChart data={adopcionesPorMes.slice(-6)} />
          </div>
        )}
      </section>

      {/* Section 4 — Rendimiento de Albergues */}
      {topAlbergues.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Home size={16} strokeWidth={2.5} />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500">
              Rendimiento de Albergues
            </h2>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400 w-12">
                    #
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                    Albergue
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                    Adopciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {topAlbergues.slice(0, 5).map((albergue, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-bold">{i + 1}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {albergue.nombre ?? albergue.nombre_albergue ?? `Albergue ${i + 1}`}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#8b9e7e]">
                      {albergue.adopciones ?? albergue.total_adopciones ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
