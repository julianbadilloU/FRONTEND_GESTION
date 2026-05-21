"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PawPrint, Eye, EyeOff, ChevronDown, ChevronUp,
  Loader2, AlertCircle, Clock, CheckCircle2, X, Search
} from "lucide-react";
import {
  getAdminMascotas,
  getMascotaHistorial,
  cambiarEstadoAdminMascota,
  getMascotaDetalle,
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

// ─── Detail modal ─────────────────────────────────────────────────────────────
function DetalleModal({ mascota, onClose }) {
  if (!mascota) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-gray-900 truncate">{mascota.nombre}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{mascota.nombre_albergue}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Photos */}
        {mascota.fotos && mascota.fotos.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mascota.fotos.map((foto) => (
                <img
                  key={foto.id_foto}
                  src={foto.url_foto}
                  alt={mascota.nombre}
                  className="w-32 h-32 rounded-2xl object-cover shrink-0"
                />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <EstadoBadge estado={mascota.estado_adopcion} />
            {mascota.fecha_publicacion && (
              <span className="text-xs text-gray-400">
                {new Date(mascota.fecha_publicacion).toLocaleDateString("es-CO", {
                  day: "2-digit", month: "short", year: "numeric"
                })}
              </span>
            )}
          </div>

          {mascota.descripcion && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5">Descripción</p>
              <p className="text-sm text-gray-700 leading-relaxed">{mascota.descripcion}</p>
            </div>
          )}

          {mascota.motivo_moderacion && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-600 mb-1">Motivo de moderación</p>
              <p className="text-sm text-amber-800">{mascota.motivo_moderacion}</p>
            </div>
          )}

          {mascota.tags && mascota.tags.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {mascota.tags.map((tag) => (
                  <span
                    key={tag.id_opcion}
                    className="text-xs bg-[#e8f0e4] text-[#4a7c59] px-2.5 py-1 rounded-full"
                  >
                    {tag.valor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
function MascotaRow({ mascota, onEstadoChange, onVerDetalle }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmando, setConfirmando] = useState(null);
  const [motivo, setMotivo] = useState("");

  const { data: historial, isLoading: loadingHistorial } = useQuery({
    queryKey: ["admin-mascota-historial", mascota.id_mascota],
    queryFn: () => getMascotaHistorial(mascota.id_mascota),
    enabled: expanded,
  });

  const logs = historial?.data ?? [];

  const handleAccion = (estado) => {
    if (confirmando === estado) {
      onEstadoChange(mascota.id_mascota, estado, motivo || undefined);
      setConfirmando(null);
      setMotivo("");
    } else {
      setConfirmando(estado);
      setMotivo("");
    }
  };

  const handleCancelar = () => {
    setConfirmando(null);
    setMotivo("");
  };

  return (
    <div className="border-b border-gray-50 last:border-0">
      {/* Fila principal */}
      <div
        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
        onClick={() => onVerDetalle(mascota.id_mascota)}
      >
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
        <div onClick={e => e.stopPropagation()}>
          <EstadoBadge estado={mascota.estado_adopcion} />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {mascota.estado_adopcion !== "oculto" && mascota.estado_adopcion !== "adoptado" && (
            <div className="flex items-center gap-1.5">
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
              {confirmando === "oculto" && (
                <button
                  onClick={handleCancelar}
                  className="text-xs text-gray-400 hover:text-gray-600 px-1"
                >
                  <X size={13} />
                </button>
              )}
            </div>
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

      {/* Motivo input when hiding */}
      {confirmando === "oculto" && (
        <div className="px-6 pb-4 bg-amber-50/50">
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Motivo de ocultamiento (opcional)"
            className="w-full text-xs border border-amber-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            rows={2}
          />
          <p className="text-[10px] text-amber-600 mt-1">El motivo se registrará en el historial de moderación.</p>
        </div>
      )}

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

// ─── Filters bar ─────────────────────────────────────────────────────────────
const ESTADOS = ["disponible", "en_proceso", "adoptado", "oculto", "archivado", "inactivo"];

function FiltersBar({ filtroEstado, setFiltroEstado, filtroAlbergue, setFiltroAlbergue, onLimpiar }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Search size={14} className="text-gray-400" />
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 bg-white"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={filtroAlbergue}
        onChange={e => setFiltroAlbergue(e.target.value)}
        placeholder="Buscar albergue…"
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 w-44"
      />
      {(filtroEstado || filtroAlbergue) && (
        <button
          onClick={onLimpiar}
          className="text-xs text-gray-400 hover:text-gray-600 underline-offset-1 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function AdminMascotasView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroAlbergue, setFiltroAlbergue] = useState("");
  const [detalleId, setDetalleId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-mascotas", page, filtroEstado, filtroAlbergue],
    queryFn: () => getAdminMascotas({ page, limit: 20, estado: filtroEstado || undefined, albergue: filtroAlbergue || undefined }),
  });

  const { data: detalleData } = useQuery({
    queryKey: ["admin-mascota-detalle", detalleId],
    queryFn: () => getMascotaDetalle(detalleId),
    enabled: detalleId !== null,
  });

const mutation = useMutation({
    mutationFn: ({ id, estado, motivo }) => cambiarEstadoAdminMascota(id, estado, motivo),
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

  const handleLimpiarFiltros = () => {
    setFiltroEstado("");
    setFiltroAlbergue("");
    setPage(1);
  };

  const handleEstadoChange = (id, estado, motivo) => {
    mutation.mutate({ id, estado, motivo });
  };

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
        ) : (
          <>
            {/* Filters */}
            <FiltersBar
              filtroEstado={filtroEstado}
              setFiltroEstado={val => { setFiltroEstado(val); setPage(1); }}
              filtroAlbergue={filtroAlbergue}
              setFiltroAlbergue={val => { setFiltroAlbergue(val); setPage(1); }}
              onLimpiar={handleLimpiarFiltros}
            />

            {/* Header tabla */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="w-10 shrink-0" />
              <p className="flex-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Mascota</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 w-24 text-right">Estado</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 w-40 text-right">Acciones</p>
            </div>

            {mascotas.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center px-6">
                <PawPrint size={40} className="text-gray-200" />
                <p className="text-gray-400 font-medium">No hay mascotas que coincidan con los filtros.</p>
              </div>
            ) : (
              mascotas.map((m) => (
                <MascotaRow
                  key={m.id_mascota}
                  mascota={m}
                  onEstadoChange={handleEstadoChange}
                  onVerDetalle={setDetalleId}
                />
              ))
            )}

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

      {/* Detail modal */}
      {detalleId && detalleData?.data && (
        <DetalleModal
          mascota={detalleData.data}
          onClose={() => setDetalleId(null)}
        />
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, show: false }))}
      />
    </div>
  );
}