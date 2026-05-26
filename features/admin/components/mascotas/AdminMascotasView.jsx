"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PawPrint, Eye, EyeOff, ChevronDown, ChevronUp, Loader2,
  AlertCircle, Clock, X, Search, RefreshCw, SlidersHorizontal
} from "lucide-react";
import {
  getAdminMascotas,
  getMascotaHistorial,
  cambiarEstadoAdminMascota,
} from "@/features/admin/services/adminMascota.service";
import { Toast } from "@/features/shared/components/Toast";
import PetDetailModal from "@/features/shared/components/PetDetailModal";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ESTADO_COLORS = {
  disponible: "bg-emerald-50 text-emerald-700 border-emerald-200",
  en_proceso: "bg-blue-50 text-blue-700 border-blue-200",
  adoptado:   "bg-[#e8f0e4] text-[#4a7c59] border-[#c5d9bc]",
  oculto:     "bg-amber-50 text-amber-700 border-amber-200",
  archivado:  "bg-gray-100 text-gray-500 border-gray-200",
  inactivo:   "bg-gray-100 text-gray-400 border-gray-200",
};

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "disponible", label: "Disponible" },
  { value: "en_proceso", label: "En proceso" },
  { value: "adoptado", label: "Adoptado" },
  { value: "oculto", label: "Oculto" },
  { value: "archivado", label: "Archivado" },
  { value: "inactivo", label: "Inactivo" },
];

const ESPECIES = [
  { value: "", label: "Todas las especies" },
  { value: "Perro", label: "🐕 Perro" },
  { value: "Gato", label: "🐈 Gato" },
  { value: "Otro", label: "🐾 Otro" },
];

// ─── Estado badge ─────────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const cls = ESTADO_COLORS[estado] ?? "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${cls}`}>
      {estado?.replace(/_/g, " ")}
    </span>
  );
}

// ─── Historial row ────────────────────────────────────────────────────────────
function HistorialRow({ log }) {
  const anterior = log.valor_anterior?.estado ?? "—";
  const nuevo    = log.valor_nuevo?.estado ?? log.valor_nuevo?.nuevo_estado ?? "—";
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 text-xs">
      <Clock size={13} className="text-gray-300 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-gray-700">{log.accion?.replace(/_/g, " ")}</span>
        {anterior !== "—" && (
          <span className="text-gray-400 ml-1.5">{anterior} → {nuevo}</span>
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

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer group"
        onClick={() => onVerDetalle(mascota.id_mascota)}>
        {/* Foto */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
          {mascota.foto ? (
            <img src={mascota.foto} alt={mascota.nombre} className="w-full h-full object-cover" />
          ) : mascota.logo_albergue ? (
            <img src={mascota.logo_albergue} alt={mascota.nombre_albergue} className="w-full h-full object-cover" />
          ) : (
            <PawPrint size={18} className="text-gray-300" />
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm truncate">{mascota.nombre}</p>
            <span className="sm:hidden shrink-0" onClick={e => e.stopPropagation()}>
              <EstadoBadge estado={mascota.estado_adopcion} />
            </span>
            {mascota.especie && (
              <span className="hidden sm:inline text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{mascota.especie}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{mascota.nombre_albergue}</p>
        </div>
        {/* Estado (desktop) */}
        <div className="hidden sm:block" onClick={e => e.stopPropagation()}>
          <EstadoBadge estado={mascota.estado_adopcion} />
        </div>
        {/* Acciones */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {mascota.estado_adopcion !== "oculto" && mascota.estado_adopcion !== "adoptado" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAccion("oculto")}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  confirmando === "oculto"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                }`}>
                <EyeOff size={13} />
                {confirmando === "oculto" ? "¿Confirmar?" : "Ocultar"}
              </button>
              {confirmando === "oculto" && (
                <button onClick={() => { setConfirmando(null); setMotivo(""); }} className="text-xs text-gray-400 hover:text-gray-600 px-1">
                  <X size={13} />
                </button>
              )}
            </div>
          )}
          {mascota.estado_adopcion === "oculto" && (
            <button
              onClick={() => handleAccion("disponible")}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                confirmando === "disponible"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}>
              <Eye size={13} />
              {confirmando === "disponible" ? "¿Confirmar?" : "Reactivar"}
            </button>
          )}
          <button
            onClick={() => { setExpanded(v => !v); setConfirmando(null); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {confirmando === "oculto" && (
        <div className="px-6 pb-4 bg-amber-50/30">
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Motivo de ocultamiento (opcional)"
            className="w-full text-xs border border-amber-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none"
            rows={2} />
          <p className="text-[10px] text-amber-500 mt-1">El motivo se registrará en el historial de moderación.</p>
        </div>
      )}

      {expanded && (
        <div className="px-6 pb-4 bg-gray-50/50">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Historial de moderación</p>
          {loadingHistorial ? (
            <div className="flex items-center gap-2 text-gray-400 text-xs"><Loader2 size={12} className="animate-spin" /> Cargando…</div>
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
function FiltersBar({ filtroEstado, setFiltroEstado, filtroEspecie, setFiltroEspecie, filtroAlbergue, setFiltroAlbergue, onLimpiar, isLoading }) {
  const hasFilters = filtroEstado || filtroEspecie || filtroAlbergue;
  return (
    <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-white">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-400">
          <SlidersHorizontal size={15} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Filtros</span>
        </div>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 bg-white cursor-pointer hover:border-gray-300 transition-colors">
          {ESTADOS.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </select>
        <select value={filtroEspecie} onChange={e => setFiltroEspecie(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 bg-white cursor-pointer hover:border-gray-300 transition-colors">
          {ESPECIES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </select>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="text" value={filtroAlbergue} onChange={e => setFiltroAlbergue(e.target.value)}
            placeholder="Buscar albergue…"
            className="text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 w-44 placeholder:text-gray-300 hover:border-gray-300 transition-colors" />
        </div>
        {hasFilters && (
          <button onClick={onLimpiar} className="text-xs text-gray-400 hover:text-gray-600 underline-offset-2 hover:underline transition-colors ml-1">Limpiar filtros</button>
        )}
        {isLoading && <Loader2 size={14} className="animate-spin text-[#8b9e7e] ml-auto" />}
      </div>
    </div>
  );
}

// ─── Admin extra content for PetDetailModal ────────────────────────────────────
function AdminPetExtras({ mascotaId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-mascota-detalle", mascotaId],
    queryFn: async () => {
      const { getMascotaDetalle } = await import("@/features/admin/services/adminMascota.service");
      const res = await getMascotaDetalle(mascotaId);
      return res?.data ?? res;
    },
    enabled: !!mascotaId,
  });

  const mascota = data;

  if (isLoading) {
    return (
      <div className="px-2 pb-4">
        <div className="animate-pulse h-16 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!mascota) return null;

  return (
    <div className="px-2 pb-8 space-y-4">
      {/* Estado de moderación */}
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">Estado de moderación</span>
        <EstadoBadge estado={mascota.estado_adopcion} />
      </div>

      {/* Motivo de moderación */}
      {mascota.motivo_moderacion && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-600 mb-1.5">Motivo de moderación</p>
          <p className="text-sm text-amber-800 leading-relaxed">{mascota.motivo_moderacion}</p>
        </div>
      )}

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="w-full py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
        Cerrar
      </button>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function AdminMascotasView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("");
  const [filtroAlbergue, setFiltroAlbergue] = useState("");
  const [detalleId, setDetalleId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["admin-mascotas", page, filtroEstado, filtroEspecie, filtroAlbergue],
    queryFn: () => getAdminMascotas({
      page, limit: 20,
      estado: filtroEstado || undefined,
      especie: filtroEspecie || undefined,
      albergue: filtroAlbergue || undefined,
    }),
    placeholderData: (prev) => prev,
  });

  const mutation = useMutation({
    mutationFn: ({ id, estado, motivo }) => cambiarEstadoAdminMascota(id, estado, motivo),
    onSuccess: (_, { estado }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-mascotas"] });
      setToast({ show: true, message: estado === "oculto" ? "Mascota ocultada correctamente." : "Mascota reactivada correctamente.", type: "success" });
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
    },
    onError: (err) => {
      setToast({ show: true, message: err?.response?.data?.message || "Error al cambiar el estado.", type: "error" });
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
    },
  });

  const setFiltro = (setter) => (val) => { setter(val); setPage(1); };

  const mascotas = data?.data ?? [];
  const meta = data?.meta ?? {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 text-[#8b9e7e] mb-1">
          <PawPrint size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Administración</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-serif italic">Supervisión de Mascotas</h1>
        <p className="text-gray-500 text-sm">Gestioná la visibilidad de las publicaciones y revisá el historial de moderación.</p>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <FiltersBar
          filtroEstado={filtroEstado} setFiltroEstado={setFiltro(setFiltroEstado)}
          filtroEspecie={filtroEspecie} setFiltroEspecie={setFiltro(setFiltroEspecie)}
          filtroAlbergue={filtroAlbergue} setFiltroAlbergue={setFiltro(setFiltroAlbergue)}
          onLimpiar={() => { setFiltroEstado(""); setFiltroEspecie(""); setFiltroAlbergue(""); setPage(1); }}
          isLoading={isFetching && !isLoading}
        />

        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 rounded w-32" /><div className="h-3 bg-gray-100 rounded w-24" /></div>
                <div className="h-6 bg-gray-100 rounded-full w-20" />
                <div className="h-8 bg-gray-100 rounded-lg w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center px-6">
            <AlertCircle size={36} className="text-rose-400" />
            <p className="text-rose-700 font-bold text-lg">Error al cargar las mascotas</p>
            <p className="text-rose-500 text-sm max-w-md">{error?.message || "Error de conexión con el servidor."}</p>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-mascotas"] })}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors">
              <RefreshCw size={14} strokeWidth={2.5} /> Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="w-12 shrink-0" />
              <p className="flex-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Mascota</p>
              <p className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 w-28 text-center">Estado</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 w-32 sm:w-40 text-right">Acciones</p>
            </div>

            {mascotas.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"><PawPrint size={28} className="text-gray-300" /></div>
                <div><p className="text-gray-400 font-medium">No hay mascotas</p><p className="text-gray-300 text-sm mt-1">Probá ajustando los filtros.</p></div>
                {(filtroEstado || filtroEspecie || filtroAlbergue) && (
                  <button onClick={() => { setFiltroEstado(""); setFiltroEspecie(""); setFiltroAlbergue(""); setPage(1); }}
                    className="text-sm text-[#5e924e] hover:underline font-medium">Limpiar filtros</button>
                )}
              </div>
            ) : (
              mascotas.map((m) => (
                <MascotaRow key={m.id_mascota} mascota={m}
                  onEstadoChange={(id, estado, motivo) => mutation.mutate({ id, estado, motivo })}
                  onVerDetalle={setDetalleId} />
              ))
            )}

            {meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
                <span className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                  Página <span className="font-semibold text-gray-700">{page}</span> de <span className="font-semibold text-gray-700">{meta.totalPages}</span>
                  {" "}· <span className="font-semibold text-gray-700">{meta.total}</span> mascotas
                </span>
                <div className="flex items-center gap-3 order-1 sm:order-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Anterior</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ PetDetailModal reutilizable + extras admin ═══ */}
      {detalleId && (
        <PetDetailModal
          mascotaId={detalleId}
          showActions={false}
          onClose={() => setDetalleId(null)}
          extraContent={<AdminPetExtras mascotaId={detalleId} onClose={() => setDetalleId(null)} />}
        />
      )}

      <Toast show={toast.show} message={toast.message} type={toast.type}
        onClose={() => setToast(t => ({ ...t, show: false }))} />
    </div>
  );
}
