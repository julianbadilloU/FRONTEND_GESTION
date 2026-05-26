"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  Dog,
  Check,
  X,
  History,
  Loader2,
  AlertCircle,
  MessageCircle,
  Heart,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  getMisCandidatos,
  getCandidatosPorMascota,
  contactarAdoptante,
  buildWhatsAppUrl,
} from "@/features/albergue/services/candidatos.service";
import { WhatsAppContactButton } from "./WhatsAppContactButton";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { AdopcionModal } from "@/features/albergue/components/adopciones/AdopcionModal";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getBarColor(pct) {
  if (pct >= 80) return "#4a7c59";
  if (pct >= 60) return "#c9a52d";
  if (pct >= 30) return "#d4841b";
  return "#9ca3af";
}

const TAG_COLORS = {
  fisica: { bg: "#e8f5e9", text: "#2e7d32" },
  animal: { bg: "#e3f2fd", text: "#1565c0" },
  personalidad: { bg: "#f3e5f5", text: "#7b1fa2" },
  estilo_vida: { bg: "#fff3e0", text: "#e65100" },
  hogar: { bg: "#e0f2f1", text: "#00695c" },
};

// ── ContactadoBadge ───────────────────────────────────────────────────────────
function ContactadoBadge({ fecha }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
      <Check size={11} strokeWidth={3} />
      Contactado {fecha ? formatDate(fecha) : ""}
    </span>
  );
}

// ── PendienteBadge ────────────────────────────────────────────────────────────
function PendienteBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
      Pendiente
    </span>
  );
}

// ── EnAdopcionBadge ──────────────────────────────────────────────────────────
function EnAdopcionBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
      <Star size={11} />
      Seleccionado
    </span>
  );
}

// ── AdoptadoBadge ─────────────────────────────────────────────────────────────
function AdoptadoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
      <Check size={11} strokeWidth={3} />
      Adoptado
    </span>
  );
}

// ── HistorialTable ────────────────────────────────────────────────────────────
function HistorialTable({ historial }) {
  if (!historial || historial.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic py-2">Sin contactos registrados.</p>
    );
  }
  return (
    <table className="w-full text-xs" aria-label="Historial de contactos">
      <thead>
        <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
          <th className="pb-2 pr-4">Fecha</th>
          <th className="pb-2">Mensaje</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {historial.map((h, i) => (
          <tr key={i}>
            <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">
              {formatDate(h.fecha)}
            </td>
            <td className="py-2 text-gray-700">{h.mensaje}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── CandidatoDetailPanel ──────────────────────────────────────────────────────
function CandidatoDetailPanel({ candidato, nombreMascota, onContactado, onClose, candidatos = [] }) {
  if (!candidato) return null;
  const adoptante = candidato.adoptante || candidato;
  const yaContactado = candidato.estado === "contactado";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={candidato.id_match}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-3xl border border-[#e5e0d8] shadow-sm p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#f0ede8] flex items-center justify-center overflow-hidden flex-shrink-0">
              {adoptante.foto_perfil ? (
                <img src={adoptante.foto_perfil} alt={adoptante.nombre_completo} className="w-full h-full object-cover" />
              ) : (
                <Users size={22} className="text-[#8b9e7e]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{adoptante.nombre_completo}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {adoptante.ciudad}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            aria-label="Cerrar panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status badge */}
        <div>
          {candidato.estado === 'en_adopcion'
            ? <EnAdopcionBadge />
            : candidato.estado === 'adoptado'
            ? <AdoptadoBadge />
            : candidato.estado === 'en_espera'
            ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">En espera</span>
            : yaContactado
            ? <ContactadoBadge fecha={candidato.historial_contactos?.at(-1)?.fecha} />
            : <PendienteBadge />
          }
        </div>

        {/* Dirección */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Dirección</span>
          <span className="text-sm font-bold text-gray-900 text-right ml-4">{adoptante.direccion || "Sin dirección"}</span>
        </div>

        {/* Compatibility */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Compatibilidad</p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={candidato.puntaje}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${candidato.puntaje}% de compatibilidad`}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(candidato.puntaje, 100)}%`, backgroundColor: getBarColor(candidato.puntaje) }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: getBarColor(candidato.puntaje) }}>
              {candidato.puntaje}%
            </span>
          </div>
        </div>

        {/* Miembro desde */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Miembro desde</span>
          <span className="text-sm font-bold text-gray-900">{adoptante.fecha_registro ? formatDate(adoptante.fecha_registro) : '—'}</span>
        </div>

        {/* Adopciones anteriores */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Adopciones anteriores</p>
          {!adoptante.adopciones_previas || adoptante.adopciones_previas.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-1">Sin adopciones previas.</p>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 font-medium">{adoptante.adopciones_previas.length} adopción(es) registrada(s)</p>
              {adoptante.adopciones_previas.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-gray-700 font-medium">{a.mascota_nombre}</span>
                  <span className="text-gray-400">{formatDate(a.fecha)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferencias — tags del adoptante */}
        {adoptante.tags?.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Preferencias</p>
            <div className="flex flex-wrap gap-1.5">
              {adoptante.tags.map((tag) => {
                const colors = TAG_COLORS[tag.categoria] || { bg: "#f0ede8", text: "#6b7280" };
                return (
                  <span
                    key={`${tag.id_tag}-${tag.valor}`}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {tag.valor}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Veces contactado */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Veces contactado</span>
          <span className="text-sm font-bold text-gray-900">{candidato.veces_contactado ?? 0}</span>
        </div>

        {/* Historial */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890] flex items-center gap-1.5">
            <History size={11} /> Historial de contactos
          </p>
          <HistorialTable historial={candidato.historial_contactos} />
        </div>

        {/* Action button — solo habilitado si no hay un seleccionado o es el seleccionado */}
        <WhatsAppContactButton
          idMatch={candidato.id_match}
          adoptante={adoptante}
          nombreMascota={nombreMascota}
          estadoInicial={candidato.estado}
          onContactado={onContactado}
          disabled={candidato.estado !== 'en_adopcion' && candidatos.some(c => c.estado === 'en_adopcion')}
          className="w-full justify-center py-3"
        />
      </motion.div>
    </AnimatePresence>
  );
}

// ── CandidatoRow ──────────────────────────────────────────────────────────────
function CandidatoRow({ candidato, nombreMascota, isSelected, onSelect, onContactado }) {
  const adoptante = candidato.adoptante || candidato;
  const yaContactado = candidato.estado === "contactado";
  const ultimoContacto = candidato.historial_contactos?.at(-1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-sm",
        isSelected ? "border-[#8b9e7e] shadow-sm" : "border-[#ece7e0] hover:border-[#c5bdb3]"
      )}
      onClick={() => onSelect(candidato)}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-[#f0ede8] flex items-center justify-center overflow-hidden flex-shrink-0">
          {adoptante.foto_perfil ? (
            <img src={adoptante.foto_perfil} alt={adoptante.nombre_completo} className="w-full h-full object-cover" />
          ) : (
            <Users size={18} className="text-[#8b9e7e]" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-gray-900 text-sm truncate">{adoptante.nombre_completo}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{adoptante.ciudad}</span>
            <span className="text-xs text-gray-300 flex-shrink-0">{formatDate(candidato.fecha)}</span>
          </div>

          {/* Status */}
          <div className="mb-2">
            {candidato.estado === 'en_adopcion'
            ? <EnAdopcionBadge />
            : candidato.estado === 'adoptado'
            ? <AdoptadoBadge />
            : candidato.estado === 'en_espera'
            ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">En espera</span>
            : yaContactado
              ? <ContactadoBadge fecha={ultimoContacto?.fecha} />
              : <PendienteBadge />
            }
          </div>

          {/* Compatibility bar */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(candidato.puntaje, 100)}%`, backgroundColor: getBarColor(candidato.puntaje) }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color: getBarColor(candidato.puntaje) }}>
              {candidato.puntaje}%
            </span>
          </div>

          {/* Tags */}
          {adoptante.tags?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1">
                {adoptante.tags.slice(0, 4).map((tag) => {
                  const colors = TAG_COLORS[tag.categoria] || { bg: "#f0ede8", text: "#6b7280" };
                  return (
                    <span
                      key={`${tag.id_tag}-${tag.valor}`}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {tag.valor}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────
export function CandidatosView({ preselectedMatchId = null }) {
  const queryClient = useQueryClient();
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [selectedCandidato, setSelectedCandidato] = useState(null);
  const [adopcionModalOpen, setAdopcionModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  }, []);

  // Fetch mascotas list (getMisCandidatos returns MATCH objects with nested mascota + adoptante)
  const { data: mascotasData, isLoading: loadingMascotas, error: errorMascotas } = useQuery({
    queryKey: ["mis-mascotas-candidatos"],
    queryFn: getMisCandidatos,
    staleTime: 30_000,
  });
  const rawMatches = Array.isArray(mascotasData) ? mascotasData : (mascotasData?.data ?? []);

  // Group matches by mascota.id_mascota to build a unique pet list for the sidebar.
  // Each unique pet shows: name, photo, match count.
  const mascotas = useMemo(() => {
    const map = new Map();
    rawMatches.forEach((match) => {
      const pet = match.mascota;
      if (!pet?.id_mascota) return;
      if (!map.has(pet.id_mascota)) {
        map.set(pet.id_mascota, {
          id_mascota: pet.id_mascota,
          nombre: pet.nombre,
          foto: pet.foto,
          especie: pet.especie,
          candidatos_count: 0,
        });
      }
      map.get(pet.id_mascota).candidatos_count++;
    });
    return Array.from(map.values());
  }, [rawMatches]);

  // Auto-select first pet when list loads
  if (!selectedMascota && mascotas.length > 0) {
    setSelectedMascota(mascotas[0]);
  }

  // Fetch candidatos for selected mascota
  const { data: candidatosData, isLoading: loadingCandidatos, error: errorCandidatos } = useQuery({
    queryKey: ["candidatos", selectedMascota?.id_mascota],
    queryFn: () => getCandidatosPorMascota(selectedMascota.id_mascota),
    enabled: !!selectedMascota,
    staleTime: 20_000,
  });

  const candidatos = Array.isArray(candidatosData) ? candidatosData : (candidatosData?.data ?? []);

  // Auto-select candidato from notification link (preselectedMatchId)
  useEffect(() => {
    if (preselectedMatchId && candidatos.length > 0 && !selectedCandidato) {
      const match = candidatos.find(c => c.id_match === preselectedMatchId);
      if (match) {
        // Also select the corresponding pet
        const pet = mascotas.find(p => p.id_mascota === match.mascota?.id_mascota || p.id_mascota === match.id_mascota);
        if (pet) setSelectedMascota(pet);
        setSelectedCandidato(match);
      }
    }
  }, [preselectedMatchId, candidatos, mascotas, selectedCandidato]);

  // Handle contact registered — update local state optimistically
  const handleContactado = useCallback((idMatch, errorMsg) => {
    if (errorMsg) {
      showToast(errorMsg, "error");
      return;
    }

    const now = new Date().toISOString();
    const nuevoMensaje = { fecha: now, mensaje: "Contactado vía WhatsApp." };

    // Update query cache optimistically
    queryClient.setQueryData(["candidatos", selectedMascota?.id_mascota], (old) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.map((c) =>
          c.id_match === idMatch
            ? {
                ...c,
                estado: "contactado",
                veces_contactado: (c.veces_contactado ?? 0) + 1,
                historial_contactos: [...(c.historial_contactos ?? []), nuevoMensaje],
              }
            : c
        ),
      };
    });

    // Invalidate queries to get official history from backend
    queryClient.invalidateQueries({ queryKey: ["candidatos", selectedMascota?.id_mascota] });

    // Update selected candidato if it's the one contacted
    setSelectedCandidato((prev) => {
      if (prev?.id_match !== idMatch) return prev;
      return {
        ...prev,
        estado: "contactado",
        veces_contactado: (prev.veces_contactado ?? 0) + 1,
        historial_contactos: [...(prev.historial_contactos ?? []), nuevoMensaje],
      };
    });

    showToast(`Contacto con WhatsApp registrado correctamente ✓`);
  }, [selectedMascota, queryClient, showToast]);

  const handleSelectMascota = (mascota) => {
    setSelectedMascota(mascota);
    setSelectedCandidato(null);
  };

  const handleAdopcionSuccess = useCallback(() => {
    showToast("¡Adopción registrada correctamente! La mascota fue marcada como adoptada.");
    setSelectedCandidato(null);
  }, [showToast]);

  return (
    <ClientAuthGuard allowedRoles={["albergue"]}>
      <div className="min-h-screen bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Candidatos</h1>
            <p className="text-gray-500 text-sm mt-1">
              Adoptantes compatibles con tus mascotas
            </p>
          </div>

          <div className="flex gap-6">
        {/* Left: Mascotas sidebar */}
        <aside className="w-72 flex-shrink-0 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890] px-1 mb-3">
            Mis Mascotas
          </p>
          {errorMascotas ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-rose-200 p-4">
              <AlertCircle size={24} className="mx-auto text-rose-400 mb-2" />
              <p className="text-sm text-rose-600 font-medium">Error al cargar mascotas</p>
              <p className="text-xs text-rose-400 mt-1">Verificá tu conexión e intentá de nuevo.</p>
            </div>
          ) : loadingMascotas ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-14 animate-pulse border border-[#ece7e0]" />
              ))}
            </div>
          ) : mascotas.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-[#e0dbd3] p-4">
              <Dog size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 font-medium">Sin mascotas registradas</p>
              <p className="text-xs text-gray-400 mt-1">Registá mascotas para ver sus candidatos.</p>
            </div>
          ) : (
          mascotas.map((m) => (
          <button
            key={m.id_mascota}
            id={`mascota-btn-${m.id_mascota}`}
            onClick={() => handleSelectMascota(m)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all",
              selectedMascota?.id_mascota === m.id_mascota
                ? "bg-white border border-[#8b9e7e] shadow-sm"
                : "bg-white border border-transparent hover:border-[#e0dbd3]"
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-[#f0ede8] flex items-center justify-center overflow-hidden flex-shrink-0">
              {m.foto ? (
                <img src={m.foto} alt={m.nombre} className="w-full h-full object-cover" />
              ) : (
                <Dog size={18} className="text-[#8b9e7e]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{m.nombre}</p>
              <p className="text-xs text-gray-400">{m.especie || ""}</p>
            </div>
            <span className="text-xs font-bold bg-[#f0ede8] text-[#8b9e7e] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
              {m.candidatos_count ?? 0}
            </span>
          </button>
          ))
          )}
        </aside>

            {/* Center: Candidatos list */}
            <div className="flex-1 min-w-0">
              {/* Mascota header */}
              {selectedMascota && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#f0ede8] flex items-center justify-center overflow-hidden">
                    {selectedMascota.foto ? (
                      <img src={selectedMascota.foto} alt={selectedMascota.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Dog size={16} className="text-[#8b9e7e]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedMascota.nombre}</h2>
                    <p className="text-sm text-gray-400">
                      {candidatos.length} Candidato{candidatos.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {/* HU-HIS-01: Completar Adopción */}
                  {candidatos.some((c) => c.estado === "contactado") && (
                    <button
                      onClick={() => setAdopcionModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#8b9e7e] hover:bg-[#7d9070] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.97]"
                      aria-label={`Completar adopción de ${selectedMascota.nombre}`}
                    >
                      <Heart size={15} className="flex-shrink-0" />
                      Completar Adopción
                    </button>
                  )}
                </div>
              )}

        {/* Candidatos */}
        {loadingCandidatos ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-[#ece7e0]" />
            ))}
          </div>
        ) : errorCandidatos ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-rose-200">
            <AlertCircle size={40} className="mx-auto text-rose-400 mb-3" />
            <p className="text-rose-600 font-medium">Error al cargar candidatos</p>
            <p className="text-rose-400 text-sm mt-1">Verificá tu conexión e intentá de nuevo.</p>
          </div>
        ) : candidatos.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#e0dbd3]">
                  <Users size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Sin candidatos aún</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Cuando adoptantes muestren interés en {selectedMascota?.nombre}, aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidatos.map((c) => (
                    <CandidatoRow
                      key={c.id_match}
                      candidato={c}
                      nombreMascota={selectedMascota?.nombre}
                      isSelected={selectedCandidato?.id_match === c.id_match}
                      onSelect={setSelectedCandidato}
                      onContactado={handleContactado}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Detail panel */}
            <div className="w-80 flex-shrink-0 relative" style={{ minHeight: '400px' }}>
              {selectedCandidato ? (
                <CandidatoDetailPanel
                  candidato={selectedCandidato}
                  nombreMascota={selectedMascota?.nombre}
                  onContactado={handleContactado}
                  onClose={() => setSelectedCandidato(null)}
                  candidatos={candidatos}
                />
              ) : (
                <div className="bg-white rounded-3xl border border-dashed border-[#e0dbd3] p-8 text-center space-y-3">
                  <MessageCircle size={36} className="mx-auto text-gray-200" />
                  <p className="text-sm text-gray-400">
                    Selecciona un candidato para ver su detalle y contactarlo
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border",
                toast.type === "success"
                  ? "bg-emerald-900 border-emerald-800 text-white"
                  : "bg-rose-900 border-rose-800 text-white"
              )}
              role="alert"
              aria-live="polite"
            >
              {toast.type === "success"
                ? <Check size={18} className="text-emerald-400" />
                : <X size={18} className="text-rose-400" />
              }
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HU-HIS-01: Adoption completion modal */}
        <AdopcionModal
          isOpen={adopcionModalOpen}
          onClose={() => setAdopcionModalOpen(false)}
          idMascota={selectedMascota?.id_mascota}
          nombreMascota={selectedMascota?.nombre}
          candidatos={candidatos}
          onSuccess={handleAdopcionSuccess}
        />
      </div>
    </ClientAuthGuard>
  );
}
