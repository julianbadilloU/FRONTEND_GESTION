"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getNotificacionesAdmin,
  eliminarNotificacionAdmin,
} from "@/features/admin/services/adminNotificacion.service";

const TIPOS_NOTIFICACION = [
  { value: "", label: "Todos los tipos" },
  { value: "nuevo_match", label: "Nuevo match" },
  { value: "match", label: "Match" },
  { value: "mascota_adoptada", label: "Mascota adoptada" },
  { value: "adopcion_confirmada", label: "Adopción confirmada" },
  { value: "contacto_albergue", label: "Albergue te contactó" },
  { value: "mascota_ocultada", label: "Mascota ocultada" },
  { value: "mascota_reactivada", label: "Mascota reactivada" },
  { value: "mascota_no_disponible", label: "Mascota no disponible" },
];

const LIMIT = 15;

// ────────────────────────────────────────────
// Componentes pequeños
// ────────────────────────────────────────────

/** Badge de estado leída / pendiente */
function EstadoBadge({ estado }) {
  const isLeida = estado === "leida";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
        isLeida
          ? "bg-gray-100 text-gray-500"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      {isLeida ? "Leída" : "Pendiente"}
    </span>
  );
}

/** Formatea fecha ISO a dd/mm/aaaa hh:mm */
function formatFecha(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Loading skeleton */
function SkeletonTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-36" />
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Modal de confirmación para eliminar */
function ConfirmDeleteModal({ notificacion, onConfirm, onCancel, loading }) {
  if (!notificacion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="p-2 bg-rose-50 rounded-full">
            <AlertTriangle size={22} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Eliminar notificación</h2>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">
          ¿Estás seguro de que deseas eliminar esta notificación?
        </p>

        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
          <p className="text-gray-500">
            <span className="font-medium text-gray-700">ID:</span> #{notificacion.id_notificacion}
          </p>
          <p className="text-gray-500">
            <span className="font-medium text-gray-700">Tipo:</span> {notificacion.titulo ?? notificacion.tipo}
          </p>
          <p className="text-gray-500 truncate">
            <span className="font-medium text-gray-700">Mensaje:</span> {notificacion.mensaje ?? "—"}
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(notificacion.id_notificacion)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Eliminando…
              </>
            ) : (
              "Eliminar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Paginación simple */
function Pagination({ page, pages, total, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <span className="text-xs text-gray-400">
        Página {page} de {pages} ({total} notificaciones)
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>

        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          // Show pages around current page
          let pageNum;
          if (pages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= pages - 2) {
            pageNum = pages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                pageNum === page
                  ? "bg-[#8b9e7e] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────

export function NotificacionesAdminView() {
  const queryClient = useQueryClient();

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);

  // Delete state
  const [notificacionAEliminar, setNotificacionAEliminar] = useState(null);

  // Query params memoized
  const params = useMemo(
    () => ({ tipo: filtroTipo, page, limit: LIMIT, desde, hasta }),
    [filtroTipo, page, desde, hasta]
  );

  // Data query
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["admin-notificaciones", params],
    queryFn: ({ queryKey }) => getNotificacionesAdmin(queryKey[1]),
    select: (res) => ({
      notificaciones: res.data ?? [],
      meta: res.meta ?? { total: 0, pages: 0, page: 1, limit: LIMIT },
    }),
  });

  const notificaciones = data?.notificaciones ?? [];
  const meta = data?.meta ?? { total: 0, pages: 0, page: 1, limit: LIMIT };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: eliminarNotificacionAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notificaciones"] });
      setNotificacionAEliminar(null);
    },
    onError: (err) => {
      console.error("[NotificacionesAdminView] Delete error:", err);
    },
  });

  // Handlers
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleTipoChange = useCallback((e) => {
    setFiltroTipo(e.target.value);
    setPage(1);
  }, []);

  const handleDesdeChange = useCallback((e) => {
    setDesde(e.target.value);
    setPage(1);
  }, []);

  const handleHastaChange = useCallback((e) => {
    setHasta(e.target.value);
    setPage(1);
  }, []);

  const confirmDelete = useCallback((id) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 text-[#8b9e7e] mb-1">
          <Bell size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Administración
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-serif italic">
          Notificaciones
        </h1>
        <p className="text-gray-500 text-sm">
          Visualiza y administra las notificaciones del sistema.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Tipo
          </label>
          <select
            value={filtroTipo}
            onChange={handleTipoChange}
            aria-label="Filtrar por tipo"
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 focus:border-[#8b9e7e]"
          >
            {TIPOS_NOTIFICACION.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desde */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={handleDesdeChange}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 focus:border-[#8b9e7e]"
          />
        </div>

        {/* Hasta */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={handleHastaChange}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 focus:border-[#8b9e7e]"
          />
        </div>

        {/* Limpiar filtros */}
        {(filtroTipo || desde || hasta) && (
          <button
            onClick={() => {
              setFiltroTipo("");
              setDesde("");
              setHasta("");
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Limpiar filtros
          </button>
        )}

        {/* Spinner de fetching silencioso */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-3.5 h-3.5 border-2 border-[#8b9e7e] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-gray-400">Actualizando…</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex flex-col items-center gap-3 text-center">
          <AlertTriangle size={28} className="text-rose-400" />
          <p className="text-rose-900 font-bold">
            Ocurrió un error al cargar las notificaciones.
          </p>
          <p className="text-rose-600 text-xs max-w-md">
            {error?.message || "Error de conexión con el servidor."}
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["admin-notificaciones"] })
            }
            className="text-rose-600 text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !error && <SkeletonTable />}

      {/* Empty state */}
      {!isLoading && !error && notificaciones.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center gap-3 text-center">
          <Bell size={36} className="text-gray-300" />
          <p className="text-gray-500 text-sm font-medium">
            {filtroTipo || desde || hasta
              ? "No se encontraron notificaciones con los filtros seleccionados."
              : "No hay notificaciones registradas en el sistema."}
          </p>
          {(filtroTipo || desde || hasta) && (
            <button
              onClick={() => {
                setFiltroTipo("");
                setDesde("");
                setHasta("");
                setPage(1);
              }}
              className="text-[#8b9e7e] text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !error && notificaciones.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Fecha
                  </th>
                  <th className="hidden sm:table-cell text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Usuario
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Tipo
                  </th>
                  <th className="hidden md:table-cell text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Mensaje
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 w-16">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {notificaciones.map((n) => (
                  <tr
                    key={n.id_notificacion}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap text-xs">
                      {formatFecha(n.fecha_creacion)}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-gray-800 font-medium max-w-[180px] truncate">
                      {n.usuario?.correo ?? (
                        <span className="text-gray-400 italic">#{n.id_notificacion}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#eef4eb] text-[#5e924e] text-[11px] font-semibold">
                        {n.titulo ?? n.tipo}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-5 py-3.5 text-gray-600 max-w-xs truncate" title={n.mensaje ?? ""}>
                      {n.mensaje ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <EstadoBadge estado={n.estado} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setNotificacionAEliminar(n)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Eliminar notificación"
                        aria-label={`Eliminar notificación #${n.id_notificacion}`}
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="px-5 py-4 border-t border-gray-100">
            <Pagination
              page={meta.page}
              pages={meta.pages}
              total={meta.total}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        notificacion={notificacionAEliminar}
        onConfirm={confirmDelete}
        onCancel={() => setNotificacionAEliminar(null)}
        loading={deleteMutation.isPending}
      />

      {/* Delete error toast-like banner */}
      {deleteMutation.isError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2">
          <AlertTriangle size={16} />
          Error al eliminar la notificación. Intenta de nuevo.
          <button
            onClick={() => deleteMutation.reset()}
            className="ml-3 underline hover:no-underline text-xs"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
