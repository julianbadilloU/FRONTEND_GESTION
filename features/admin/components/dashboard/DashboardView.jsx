"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users,
  Home,
  PawPrint,
  Heart,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import { getEstadisticas } from "@/features/admin/services/adminStats.service";
import { DateRangeFilter } from "./DateRangeFilter";
import { AdoptionFunnel } from "./AdoptionFunnel";
import { MatchFunnel } from "./MatchFunnel";

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const SPECIES_COLORS = ["#8b9e7e", "#6b8fa3", "#c9a96e", "#b8b8b8"];

// ── Sub-components ──────────────────────────────────────────────

function KpiCard({ label, value, sub, trend, trendLabel, sparkline }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-3 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
        {label}
      </p>
      <p className="text-4xl font-bold text-gray-900">{value ?? "—"}</p>

      {/* Trend indicator (Task 2.1) */}
      {trend !== undefined && trend !== null && (
        <div className="flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp size={14} className="text-emerald-600" strokeWidth={2.5} />
          ) : (
            <TrendingDown size={14} className="text-rose-500" strokeWidth={2.5} />
          )}
          <span
            className={`text-xs font-bold ${
              trend >= 0 ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
          {trendLabel && (
            <span className="text-[10px] text-gray-400 ml-0.5">{trendLabel}</span>
          )}
        </div>
      )}

      {/* Sparkline chart (Task 2.1) */}
      {sparkline && sparkline.length > 0 && (
        <div className="h-[30px]">
          <ResponsiveContainer width="100%" height={30}>
            <AreaChart data={sparkline.map((v, i) => ({ i, v }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#8b9e7e"
                strokeWidth={1.5}
                fill="#8b9e7e"
                fillOpacity={0.15}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legacy sub (progress bar) — only when no trend/sparkline */}
      {sub !== undefined && trend === undefined && !sparkline && (
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

function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-3">
      <div className="h-3 bg-gray-100 rounded w-24" />
      <div className="h-9 bg-gray-100 rounded w-16" />
    </div>
  );
}

function WidgetSkeleton({ height = "h-48" }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-32 mb-6" />
      <div className={`${height} bg-gray-50 rounded-xl flex items-center justify-center`}>
        <Loader2 className="animate-spin text-gray-200" size={24} />
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
        <Icon size={24} className="text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-gray-400">{message}</p>
      {sub && <p className="text-xs text-gray-300 mt-1">{sub}</p>}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="max-w-md mx-auto mt-12 bg-rose-50 border border-rose-100 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
      <AlertCircle size={32} className="text-rose-400" strokeWidth={2} />
      <p className="text-rose-900 font-bold text-lg">
        Error al cargar estadísticas
      </p>
      <p className="text-rose-700 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors"
      >
        <RefreshCw size={14} strokeWidth={2.5} />
        Reintentar
      </button>
    </div>
  );
}

// ── Collapsible Section Wrapper ──────────────────────────────────

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-gray-700 w-full text-left"
      >
        {Icon && <Icon size={16} strokeWidth={2.5} />}
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500">
          {title}
        </h2>
        <span className="ml-auto text-gray-400">
          {open ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
        </span>
      </button>
      {open && children}
    </section>
  );
}

const MASCOTA_ESTADOS = [
  { key: "disponible", label: "Disponible", color: "bg-emerald-400" },
  { key: "en_proceso", label: "En proceso", color: "bg-blue-400" },
  { key: "adoptado", label: "Adoptado", color: "bg-[#8b9e7e]" },
  { key: "archivado", label: "Archivado", color: "bg-gray-300" },
];

function DonutLegend({ mascotas, porEstado }) {
  const total = mascotas?.total ?? 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
        Mascotas por estado
      </p>
      <p className="text-5xl font-bold text-gray-900 mb-6">{total}</p>
      <p className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-widest">
        Total publicadas
      </p>
      <div className="space-y-3">
        {MASCOTA_ESTADOS.map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {porEstado?.[key] ?? "0"}
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
            <span className="text-xs font-bold text-gray-700">
              {item.total ?? 0}
            </span>
            <div
              className="w-full bg-[#8b9e7e] rounded-t-lg transition-all"
              style={{
                height: `${height}px`,
                minHeight: height > 0 ? "4px" : "0",
              }}
            />
            <span className="text-[10px] text-gray-400 font-semibold">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SpeciesPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
          Distribución por especie
        </p>
        <EmptyState
          icon={PawPrint}
          message="Sin datos de especie"
          sub="No hay mascotas registradas con esta información"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
        Distribución por especie
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                dataKey="total"
                nameKey="especie"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.especie}
                    fill={SPECIES_COLORS[index % SPECIES_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, props) => [
                  `${value} mascotas`,
                  props.payload.especie,
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5">
          {data.map((entry, index) => (
            <div key={entry.especie} className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    SPECIES_COLORS[index % SPECIES_COLORS.length],
                }}
              />
              <span className="text-sm text-gray-600">{entry.especie}</span>
              <span className="text-sm font-bold text-gray-900 ml-2">
                {entry.total}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewUsersChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
          Nuevos usuarios por mes
        </p>
        <EmptyState
          icon={Users}
          message="Sin datos de nuevos usuarios"
          sub="No hay registros en el período seleccionado"
        />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    index: d.mes,
  }));

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
        Nuevos usuarios por mes
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b9e7e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b9e7e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#8b9e7e"
              strokeWidth={2}
              fill="url(#userGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GeographicBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
          Adopciones por departamento
        </p>
        <EmptyState
          icon={BarChart2}
          message="Sin datos geográficos"
          sub="No hay adopciones registradas en el período seleccionado"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
        Adopciones por departamento
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="departamento"
              tick={{ fontSize: 11, fill: "#4b5563" }}
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <Tooltip
              formatter={(value) => [`${value} adopciones`, "Total"]}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }}
            />
            <Bar dataKey="total" fill="#8b9e7e" radius={[0, 4, 4, 0]} barSize={16} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TagBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
          Tags populares
        </p>
        <EmptyState
          icon={BarChart2}
          message="Sin datos de tags"
          sub="No hay tags registrados"
        />
      </div>
    );
  }

  const MAX_HEIGHT = 120;
  const max = Math.max(...data.map((d) => d.total ?? 0), 1);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
        Tags populares
      </p>
      <div className="space-y-3">
        {data.map((d, i) => {
          const height = Math.round(((d.total ?? 0) / max) * MAX_HEIGHT);
          return (
            <div key={d.valor ?? i} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold w-6 text-right shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 font-medium truncate">
                    {d.valor ?? d.tag ?? `Tag ${i + 1}`}
                  </span>
                  <span className="font-bold text-gray-900 ml-2">{d.total}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(height, 2)}%`,
                      backgroundColor: "#e07a5f",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function DashboardView() {
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState({ desde: "", hasta: "" });

  const queryParams = {};
  if (dateFilter.desde) queryParams.desde = dateFilter.desde;
  if (dateFilter.hasta) queryParams.hasta = dateFilter.hasta;

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-stats", queryParams],
    queryFn: () => getEstadisticas(queryParams),
  });

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
        <ErrorState message={error.message} onRetry={handleRetry} />
      </div>
    );
  }

  const usuarios = stats?.usuarios ?? {};
  const mascotas = stats?.mascotas ?? {};
  const mascotasPorEstado = mascotas.por_estado ?? {};
  const matching = stats?.matching ?? {};
  const adopcionesPorMes = matching.adopciones_por_mes ?? [];
  const topAlbergues = stats?.albergues_ranking ?? stats?.top_albergues ?? [];
  const especies = stats?.especies_distribucion ?? [];
  const nuevosUsuarios = stats?.nuevos_usuarios_por_mes ?? [];
  const tasa = usuarios.tasa_completitud ?? usuarios.tasa_completitud_perfil ?? 0;
  const kpiTrends = stats?.kpi_trends ?? {};
  const distribucionGeografica = stats?.distribucion_geografica ?? [];
  const tagsPopulares = stats?.tags_populares ?? [];
  const matchFunnelData = stats?.match_funnel ?? {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 text-[#8b9e7e] mb-1">
          <BarChart2 size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Administración
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-serif italic">
          Dashboard de Estadísticas
        </h1>
        <p className="text-gray-500 text-sm">
          Resumen global de la plataforma FurMatch.
        </p>
      </div>

      {/* Date Filter */}
      <DateRangeFilter
        desde={dateFilter.desde}
        hasta={dateFilter.hasta}
        onChange={(f) => setDateFilter(f)}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-8 sm:space-y-10">
          {/* KPI Skeletons */}
          <section className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <KpiCardSkeleton key={i} />
              ))}
            </div>
          </section>

          {/* Gráficos de adopción Skeletons */}
          <section className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-36 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WidgetSkeleton height="h-48" />
              <WidgetSkeleton height="h-48" />
            </div>
          </section>

          {/* Embudos Skeletons */}
          <section className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WidgetSkeleton height="h-56" />
              <WidgetSkeleton height="h-56" />
            </div>
          </section>

          {/* Nuevos Usuarios Skeleton */}
          <section className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-40 animate-pulse" />
            <WidgetSkeleton height="h-48" />
          </section>

          {/* Matching KPI Skeletons */}
          <section className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-44 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
              {Array.from({ length: 4 }).map((_, i) => (
                <KpiCardSkeleton key={i} />
              ))}
            </div>
            <WidgetSkeleton height="h-32" />
          </section>

          {/* Geo + Tags Skeletons */}
          <section className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WidgetSkeleton height="h-64" />
              <WidgetSkeleton height="h-48" />
            </div>
          </section>

          {/* Ranking Skeleton */}
          <section className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-36 animate-pulse" />
            <WidgetSkeleton height="h-40" />
          </section>
        </div>
      ) : (
        <>
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
              <KpiCard label="Suspendidos" value={usuarios.suspendidos} />
            </div>
            <div className="grid grid-cols-1 max-w-xs">
              <KpiCard label="Completitud perfil" value={`${tasa}%`} sub={tasa} />
            </div>
          </section>

          {/* Section 2 — Gráficos de adopción */}
          <CollapsibleSection title="Gráficos de adopción" icon={PawPrint}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DonutLegend mascotas={mascotas} porEstado={mascotasPorEstado} />
              <SpeciesPieChart data={especies} />
            </div>
          </CollapsibleSection>

          {/* Section 3 — Embudos */}
          <CollapsibleSection title="Embudos" icon={BarChart2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdoptionFunnel
                data={[
                  { label: "disponible", count: mascotasPorEstado.disponible ?? 0 },
                  { label: "en_proceso", count: mascotasPorEstado.en_proceso ?? 0 },
                  { label: "adoptado", count: mascotasPorEstado.adoptado ?? 0 },
                ]}
              />
              <MatchFunnel
                data={[
                  { label: "pendiente", count: matchFunnelData.pendiente ?? 0 },
                  { label: "contactado", count: matchFunnelData.contactado ?? 0 },
                  { label: "en_adopcion", count: matchFunnelData.en_adopcion ?? 0 },
                  { label: "adoptado", count: matchFunnelData.adoptado ?? 0 },
                ]}
              />
            </div>
          </CollapsibleSection>

          {/* Section 4 — Nuevos Usuarios */}
          <CollapsibleSection title="Nuevos Usuarios" icon={Users}>
            <NewUsersChart data={nuevosUsuarios} />
          </CollapsibleSection>

          {/* Section 5 — Matching KPIs con tendencias */}
          <CollapsibleSection title="Matching KPIs con tendencias" icon={Heart}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mb-6">
              <KpiCard label="Total matches" value={matching.total_matches} />
              <KpiCard label="Total adopciones" value={matching.total_adopciones} />
              <KpiCard
                label="Tasa conversión"
                value={
                  matching.total_matches > 0
                    ? `${Math.round(
                        (matching.total_adopciones / matching.total_matches) * 100
                      )}%`
                    : "0%"
                }
                trend={kpiTrends.variacion_tasa_adopcion}
                trendLabel="vs periodo anterior"
              />
              <KpiCard label="Mascotas disponibles" value={mascotasPorEstado.disponible ?? 0} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mb-6">
              <KpiCard
                label="Tasa adopción actual"
                value={`${kpiTrends.tasa_adopcion_actual ?? 0}%`}
                trend={kpiTrends.variacion_tasa_adopcion}
                trendLabel="vs anterior"
              />
              <KpiCard
                label="Promedio días adopción"
                value={kpiTrends.promedio_dias_adopcion != null ? `${kpiTrends.promedio_dias_adopcion} días` : "—"}
              />
              <KpiCard
                label="Tasa de descarte"
                value={`${kpiTrends.tasa_descarte ?? 0}%`}
              />
              <KpiCard
                label="Crecimiento mensual"
                value={kpiTrends.crecimiento_mensual != null ? `${kpiTrends.crecimiento_mensual}%` : "—"}
              />
            </div>

            {adopcionesPorMes.length > 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-6">
                  Adopciones por mes
                </p>
                <BarChart data={adopcionesPorMes.slice(-6)} />
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
                  Adopciones por mes
                </p>
                <EmptyState
                  icon={Heart}
                  message="Sin adopciones en este período"
                />
              </div>
            )}
          </CollapsibleSection>

          {/* Section 6 — Distribución geográfica + tags */}
          <CollapsibleSection title="Distribución geográfica + tags" icon={BarChart2}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GeographicBarChart data={distribucionGeografica} />
              <TagBarChart data={tagsPopulares} />
            </div>
          </CollapsibleSection>

          {/* Section 7 — Ranking albergues */}
          <CollapsibleSection title="Ranking albergues" icon={Home}>
            {topAlbergues.length > 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400 w-12">
                        #
                      </th>
                      <th className="text-left px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                        Albergue
                      </th>
                      <th className="text-right px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                        Adopciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAlbergues.slice(0, 5).map((albergue, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-4 text-gray-400 font-bold text-xs sm:text-sm">
                          {i + 1}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-900 font-semibold text-sm truncate max-w-[120px] sm:max-w-none">
                          {albergue.nombre ??
                            albergue.nombre_albergue ??
                            `Albergue ${i + 1}`}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right font-bold text-[#8b9e7e] text-sm">
                          {albergue.adopciones ??
                            albergue.total_adopciones ??
                            0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Home}
                message="Sin datos de albergues"
                sub="No hay albergues con adopciones registradas en el período"
              />
            )}
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}
