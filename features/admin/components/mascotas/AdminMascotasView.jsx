"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PawPrint, Eye, EyeOff, ChevronDown, ChevronUp,
  Loader2, AlertCircle, Clock, CheckCircle2
} from "lucide-react";
import {
  getAdminMascotas,
  getMascotaHistorial,
  cambiarEstadoAdminMascota,
} from "@/features/admin/services/adminMascota.service";
import { Toast } from "@/features/shared/components/Toast";

// ─── Estado badge ─────────────────────────────────────────────────────────────
const ESTADO_COLORS = {
  disponible: "bg-emerald-50 text-emerald-700",
  en_proceso: "bg-blue-50 text-blue-700",
  adoptado:   "bg-[#e8f0e4] text-[#4a7c59]",
  oculto:     "bg-amber-50 text-amber-700",
  archivado:  "bg-gray-100 text-gray-500",
  inactivo:   "bg-gray-100 text-gray-400",
};

function EstadoBadge({ estado }) {
  const cls = ESTADO_COLORS[estado] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>
      {estado?.replace(/_/g, " ")}
    </span>
  );
}

// ─── Historial row ────────────────────────────────────────────────────────────
function HistorialRow({ log }) {
  const anterior = log.valor_anterior?.estado ?? "—";
  const nuevo    = log.valor_nuevo?.estado ?? log.valor_nuevo?.nuevo_estado ?? "—";
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 text-xs">
      <Clock size={12} className="text-gray-300 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-gray-700">{log.accion?.replace(/_/g, " ")}</span>
        {anterior !== "—" && (
          <span className="text-gray-400 ml-2">{anterior} → {nuevo}</span>
        )}
      </div>
      <span className="text-gray-300 shrink-0">
        {new Date(log.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    </div>
  );
}

// ─── Mascota row ──────────────────────────────────────────────────────────────
function MascotaRow({ mascota, onEstadoChange }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmando, setConfirmando] = useState(null); // 'oculto' | 'disponible'

  const { data: historial, isLoading: loadingHistorial } = useQuery({
    queryKey: ["admin-mascota-historial", mascota.id_mascota],
    queryFn: () => getMascotaHistorial(mascota.id_mascota),
    enabled: expanded,
  });

  const logs = historial?.data ?? [];

  const handleAccion = (estado) => {
    if (confirmando === estado) {
      onEstadoChange(mascota.id_mascota, estado);
      setConfirmando(null);
    } else {
      setConfirmando(estado);
    }
  };

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* Fila principal */}
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
        {/* Foto */}
        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
          {mascota.foto ? (
            <img src={mascota.foto} alt={mascota.nombre} className="w-full h-full object-cover" />
          ) : (
            <PawPrint size={16} className="text-gray-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{mascota.nombre}</p>
          <p className="text-xs text-gray-400 truncate">{mascota.nombre_albergue}</p>
        </div>

        {/* Estado */}
        <EstadoBadge estado={mascota.estado_adopcion} />

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          {mascota.estado_adopcion !== "oculto" && mascota.estado_adopcion !== "adoptado" && (
            <button
              onClick={() => handleAccion("oculto")}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                confirmando === "oculto"
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
              title="Ocultar mascota"
            >
              <EyeOff size={13} />
              {confirmando === "oculto" ? "¿Confirmar?" : "Ocultar"}
            </button>
          )}
          {mascota.estado_adopcion === "oculto" && (
            <button
              onClick={() => handleAccion("disponible")}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                confirmando === "disponible"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
              title="Reactivar mascota"
            >
              <Eye size={13} />
              {confirmando === "disponible" ? "¿Confirmar?" : "Reactivar"}
            </button>
          )}

          {/* Historial toggle */}
          <button
            onClick={() => { setExpanded(v => !v); setConfirmando(null); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Ver historial de moderación"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Historial expandible */}
      {expanded && (
        <div className="px-6 pb-4 bg-gray-50/50">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">
            Historial de moderación
          </p>
          {loadingHistorial ? (
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Loader2 size={12} className="animate-spin" /> Cargando…
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Sin acciones de moderación registradas.</p>
          ) : (
            <div>{logs.map((log) => <HistorialRow key={log.id} log={log} />)}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function AdminMascotasView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-mascotas", page],
    queryFn: () => getAdminMascotas({ page, limit: 20 }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, estado }) => cambiarEstadoAdminMascota(id, estado),
    onSuccess: (_, { estado }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-mascotas"] });
      setToast({
        show: true,
        message: estado === "oculto" ? "Mascota ocultada correctamente." : "Mascota reactivada correctamente.",
        type: "success",
      });
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
    },
    onError: (err) => {
      setToast({
        show: true,
        message: err?.response?.data?.message || "Error al cambiar el estado.",
        type: "error",
      });
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
    },
  });

  const mascotas = data?.data ?? [];
  const meta = data?.meta ?? {};

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 text-[#8b9e7e] mb-1">
          <PawPrint size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Administración</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-serif italic">
          Supervisión de Mascotas
        </h1>
        <p className="text-gray-500 text-sm">
          Gestioná la visibilidad de las publicaciones y revisá el historial de moderación.
        </p>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#8b9e7e]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center px-6">
            <AlertCircle size={32} className="text-rose-400" />
            <p className="text-rose-600 font-medium">Error al cargar las mascotas.</p>
          </div>
        ) : mascotas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center px-6">
            <PawPrint size={40} className="text-gray-200" />
            <p className="text-gray-400 font-medium">No hay mascotas publicadas.</p>
          </div>
        ) : (
          <>
            {/* Header tabla */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="w-10 shrink-0" />
              <p className="flex-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Mascota</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 w-24 text-right">Estado</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 w-40 text-right">Acciones</p>
            </div>

            {mascotas.map((m) => (
              <MascotaRow
                key={m.id_mascota}
                mascota={m}
                onEstadoChange={(id, estado) => mutation.mutate({ id, estado })}
              />
            ))}

            {/* Paginación */}
            {meta.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página <span className="font-semibold text-gray-700">{page}</span> de{" "}
                  <span className="font-semibold text-gray-700">{meta.pages}</span>
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= meta.pages}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, show: false }))}
      />
    </div>
  );
}
