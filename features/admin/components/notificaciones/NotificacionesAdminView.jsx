"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { getNotificacionesAdmin } from "@/features/admin/services/adminNotificacion.service";

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

/** Renderiza el badge de estado con color */
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

export function NotificacionesAdminView() {
  const queryClient = useQueryClient();
  const [filtroTipo, setFiltroTipo] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-notificaciones", filtroTipo],
    queryFn: () => getNotificacionesAdmin({ tipo: filtroTipo, limit: 100 }),
    select: (res) => ({
      notificaciones: res.data ?? [],
      meta: res.meta ?? { total: 0, pages: 0, page: 1, limit: 100 },
    }),
  });

  const notificaciones = data?.notificaciones ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen space-y-8">
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
          Visualiza todas las notificaciones del sistema.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          aria-label="Filtrar por tipo"
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 focus:border-[#8b9e7e]"
        >
          {TIPOS_NOTIFICACION.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <span className="text-xs text-gray-400 ml-auto">
          {total} notificación{total !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex flex-col items-center gap-3 text-center">
          <p className="text-rose-900 font-bold">
            Ocurrió un error al cargar las notificaciones.
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

      {/* Tabla */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="w-5 h-5 border-2 border-[#8b9e7e] border-t-transparent rounded-full animate-spin" />
            Cargando notificaciones…
          </div>
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center gap-3 text-center">
          <Bell size={32} className="text-gray-300" />
          <p className="text-gray-500 text-sm font-medium">
            No hay notificaciones{filtroTipo ? " con este filtro" : ""}.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Fecha
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Usuario
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Tipo
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Mensaje
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                    Estado
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
                    <td className="px-5 py-3.5 text-gray-800 font-medium">
                      {n.usuario?.correo ?? (
                        <span className="text-gray-400 italic">#{n.id_notificacion}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#eef4eb] text-[#5e924e] text-[11px] font-semibold">
                        {n.titulo ?? n.tipo}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">
                      {n.mensaje ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <EstadoBadge estado={n.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
