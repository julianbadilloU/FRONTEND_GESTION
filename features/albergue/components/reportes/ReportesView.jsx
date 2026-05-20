"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import {
  obtenerHistorialAdopciones,
  exportarCSV,
  exportarExcel,
} from "@/features/albergue/services/adopciones.service";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── EstadoBadge ────────────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
  const config = {
    completada: {
      label: "Completada",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Icon: CheckCircle2,
    },
    completado: {
      label: "Completado",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Icon: CheckCircle2,
    },
    en_proceso: {
      label: "En proceso",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      Icon: Clock,
    },
    cancelada: {
      label: "Cancelada",
      className: "bg-red-50 text-red-600 border-red-100",
      Icon: AlertCircle,
    },
  };

  const { label, className, Icon } = config[estado] ?? {
    label: estado ?? "—",
    className: "bg-gray-50 text-gray-500 border-gray-100",
    Icon: AlertCircle,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, isLoading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      {isLoading ? (
        <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mt-1" />
      ) : (
        <span className="text-3xl font-bold text-gray-900">{value ?? 0}</span>
      )}
    </div>
  );
}

// ── ExportButton ───────────────────────────────────────────────────────────────

function ExportButton({ onClick, icon: Icon, label, isLoading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#8b9e7e] text-white hover:bg-[#7a8e6e] active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {isLoading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Icon size={15} />
      )}
      {label}
    </button>
  );
}

// ── ReportesView ───────────────────────────────────────────────────────────────

export function ReportesView() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("");
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportError, setExportError] = useState(null);

  const queryParams = {
    ...(estado && { estado }),
    ...(fechaDesde && { fecha_desde: fechaDesde }),
    ...(fechaHasta && { fecha_hasta: fechaHasta }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["reportes-adopciones", queryParams],
    queryFn: () => obtenerHistorialAdopciones(queryParams),
  });

  const adopciones = Array.isArray(data) ? data : (data?.data ?? []);
  const meta = data?.meta ?? null;

  // Compute stats from the full unfiltered fetch (no filters applied to stats)
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["reportes-adopciones-stats"],
    queryFn: () => obtenerHistorialAdopciones({ limit: 9999 }),
  });

  const allAdopciones = Array.isArray(statsData)
    ? statsData
    : (statsData?.data ?? []);

  const totalCompletadas = allAdopciones.filter(
    (a) => a.estado === "completada" || a.estado === "completado",
  ).length;
  const totalEnProceso = allAdopciones.filter(
    (a) => a.estado === "en_proceso",
  ).length;
  const totalAll = meta?.total ?? allAdopciones.length;

  // ── Export handlers ──────────────────────────────────────────────────────────

  async function handleExportCSV() {
    setExportError(null);
    setExportingCSV(true);
    try {
      await exportarCSV(queryParams);
    } catch {
      setExportError("No se pudo descargar el CSV. Intentá de nuevo.");
    } finally {
      setExportingCSV(false);
    }
  }

  async function handleExportExcel() {
    setExportError(null);
    setExportingExcel(true);
    try {
      await exportarExcel(queryParams);
    } catch {
      setExportError("No se pudo descargar el Excel. Intentá de nuevo.");
    } finally {
      setExportingExcel(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2.5">
              <FileText size={28} className="text-[#8b9e7e]" />
              Reportes
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Exportá el historial de adopciones de tu albergue
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <ExportButton
              onClick={handleExportCSV}
              icon={Download}
              label="Exportar CSV"
              isLoading={exportingCSV}
              disabled={exportingExcel}
            />
            <ExportButton
              onClick={handleExportExcel}
              icon={FileSpreadsheet}
              label="Exportar Excel"
              isLoading={exportingExcel}
              disabled={exportingCSV}
            />
          </div>
        </div>

        {/* Export error */}
        {exportError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle size={15} />
            {exportError}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total adopciones" value={totalAll} isLoading={statsLoading} />
          <StatCard label="Completadas" value={totalCompletadas} isLoading={statsLoading} />
          <StatCard label="En proceso" value={totalEnProceso} isLoading={statsLoading} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Estado */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/40 focus:border-[#8b9e7e] transition"
              >
                <option value="">Todos</option>
                <option value="en_proceso">En proceso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Fecha desde */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                max={fechaHasta || undefined}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/40 focus:border-[#8b9e7e] transition"
              />
            </div>

            {/* Fecha hasta */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                min={fechaDesde || undefined}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/40 focus:border-[#8b9e7e] transition"
              />
            </div>
          </div>
        </div>

        {/* Results table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-14 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-red-100">
            <AlertCircle size={48} className="mx-auto text-red-300 mb-4" />
            <p className="text-red-500 font-medium">Error al cargar el historial.</p>
            <p className="text-gray-400 text-sm mt-1">Intenta de nuevo más tarde.</p>
          </div>
        ) : adopciones.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No hay adopciones que coincidan con los filtros.</p>
            <p className="text-gray-400 text-sm mt-1">
              Probá cambiando el rango de fechas o el estado.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Mascota
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Adoptante
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 hidden sm:table-cell">
                      Fecha
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {adopciones.map((adopcion, index) => {
                    const id = adopcion.id_adopcion ?? adopcion.id ?? index;
                    const petName =
                      adopcion.mascota?.nombre ?? adopcion.nombre_mascota ?? "—";
                    const adopterName =
                      adopcion.adoptante?.nombre ?? adopcion.nombre_adoptante ?? "—";
                    const date =
                      adopcion.fecha_adopcion ??
                      adopcion.fecha_completado ??
                      adopcion.createdAt ??
                      null;
                    const estadoVal = adopcion.estado ?? adopcion.status ?? "completada";

                    return (
                      <tr key={id} className="hover:bg-[#f8faf7] transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 text-sm">{petName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{adopterName}</span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-500">{formatDate(date)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <EstadoBadge estado={estadoVal} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Row count footer */}
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Mostrando {adopciones.length} resultado{adopciones.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
