"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Heart, Users, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { completarAdopcion } from "@/features/albergue/services/adopciones.service";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Normalises a candidato item to extract the adopter's ID and display name.
 * The backend returns nested `adoptante.id_usuario`, but CandidatosView
 * may present the data with top-level fields — handle both shapes.
 */
function resolveAdoptante(candidato) {
  const id =
    candidato?.adoptante?.id_usuario ??
    candidato?.id_adoptante ??
    null;

  const nombre =
    candidato?.adoptante?.nombre_completo ??
    candidato?.nombre_completo ??
    "Adoptante";

  const foto =
    candidato?.adoptante?.foto_perfil ??
    candidato?.foto_perfil ??
    null;

  const ciudad =
    candidato?.adoptante?.ciudad ??
    candidato?.ciudad ??
    null;

  return { id, nombre, foto, ciudad };
}

// ── AdoptanteOption ────────────────────────────────────────────────────────────

function AdoptanteOption({ candidato, selected, onSelect }) {
  const { id, nombre, foto, ciudad } = resolveAdoptante(candidato);

  return (
    <label
      htmlFor={`adoptante-${id}`}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 select-none group",
        selected
          ? "border-[#8b9e7e] bg-[#8b9e7e]/5 shadow-sm"
          : "border-[#ece7e0] bg-white hover:border-[#c5bdb3] hover:bg-[#faf9f7]"
      )}
    >
      <input
        id={`adoptante-${id}`}
        type="radio"
        name="adoptante_seleccionado"
        value={id}
        checked={selected}
        onChange={() => onSelect(candidato)}
        className="sr-only"
      />

      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-[#f0ede8] flex items-center justify-center overflow-hidden flex-shrink-0">
        {foto ? (
          <img src={foto} alt={nombre} className="w-full h-full object-cover" />
        ) : (
          <Users size={18} className="text-[#8b9e7e]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{nombre}</p>
        {ciudad && (
          <p className="text-xs text-gray-400 truncate">{ciudad}</p>
        )}
        {candidato.puntaje != null && (
          <p className="text-[10px] font-bold text-[#8b9e7e] mt-0.5">
            {candidato.puntaje}% compatibilidad
          </p>
        )}
      </div>

      {/* Selection indicator */}
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150",
          selected
            ? "border-[#8b9e7e] bg-[#8b9e7e]"
            : "border-gray-300 group-hover:border-[#8b9e7e]/50"
        )}
        aria-hidden="true"
      >
        {selected && <Check size={11} strokeWidth={3} className="text-white" />}
      </div>
    </label>
  );
}

// ── AdopcionModal ──────────────────────────────────────────────────────────────

/**
 * AdopcionModal
 *
 * Props:
 *   isOpen        — controls visibility
 *   onClose       — called when the modal should close
 *   idMascota     — ID of the pet being adopted (required for POST /api/adopciones)
 *   nombreMascota — display name for the pet
 *   candidatos    — array of candidato objects (from getCandidatosPorMascota)
 *                   must include adopted estado="contactado" candidates
 *   onSuccess     — optional callback(adopcionData) after successful registration
 */
export function AdopcionModal({
  isOpen,
  onClose,
  idMascota,
  nombreMascota,
  candidatos = [],
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const [selectedCandidato, setSelectedCandidato] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const firstOptionRef = useRef(null);

  // Only show contactados — the shelter can only complete adoption for
  // someone they already contacted.
  const contactados = candidatos.filter((c) => c.estado === "contactado");

  // Reset state and focus when modal opens / closes
  useEffect(() => {
    if (!isOpen) return;
    // Schedule reset after paint so it doesn't trigger a synchronous cascade
    const id = setTimeout(() => {
      setSelectedCandidato(null);
      setObservaciones("");
      if (firstOptionRef.current) firstOptionRef.current.focus();
    }, 0);
    return () => clearTimeout(id);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const isPending = mutation.isPending;
    const onKey = (e) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, mutation.isPending]);

  const mutation = useMutation({
    mutationFn: () => {
      const { id: idAdoptante } = resolveAdoptante(selectedCandidato);
      return completarAdopcion({
        id_mascota: idMascota,
        id_adoptante: idAdoptante,
        observaciones: observaciones.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      // Invalidate candidates and history so both views refresh automatically
      queryClient.invalidateQueries({ queryKey: ["candidatos", idMascota] });
      queryClient.invalidateQueries({ queryKey: ["mis-mascotas-candidatos"] });
      queryClient.invalidateQueries({ queryKey: ["historial-adopciones"] });
      onSuccess?.(data);
      onClose();
    },
  });

  const canSubmit =
    selectedCandidato !== null &&
    resolveAdoptante(selectedCandidato).id !== null &&
    !mutation.isPending;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adopcion-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !mutation.isPending && onClose()}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative bg-white rounded-[2rem] shadow-2xl shadow-black/10 w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col border border-gray-100/60"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 flex items-center justify-between bg-gradient-to-br from-[#f8faf7] to-white border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#8b9e7e]/20 to-[#8b9e7e]/5 text-[#6d8060] rounded-xl flex items-center justify-center ring-1 ring-[#8b9e7e]/20">
                <Heart size={20} strokeWidth={2} />
              </div>
              <div>
                <h2
                  id="adopcion-modal-title"
                  className="text-[1.2rem] font-bold text-gray-900 font-serif italic leading-tight"
                >
                  Completar Adopción
                </h2>
                {nombreMascota && (
                  <p className="text-[9px] text-[#8b9e7e] font-bold uppercase tracking-[0.2em] mt-0.5">
                    {nombreMascota}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => !mutation.isPending && onClose()}
              disabled={mutation.isPending}
              className="p-2 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-150 disabled:opacity-40"
              aria-label="Cerrar modal"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Success state */}
            {mutation.isSuccess && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check size={32} className="text-emerald-500" />
                </div>
                <p className="text-base font-bold text-gray-900">
                  ¡Adopción registrada!
                </p>
                <p className="text-sm text-gray-500">
                  El proceso de adopción fue completado exitosamente.
                </p>
              </div>
            )}

            {/* Error state */}
            {mutation.isError && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <AlertCircle size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-rose-700">
                    Error al registrar la adopción
                  </p>
                  <p className="text-xs text-rose-500 mt-0.5">
                    {mutation.error?.response?.data?.message ||
                      mutation.error?.response?.data?.errors?.[0]?.message ||
                      "Verificá los datos e intentá de nuevo."}
                  </p>
                </div>
              </div>
            )}

            {/* No contactados warning */}
            {!mutation.isSuccess && contactados.length === 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">
                    Sin adoptantes contactados
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Debés contactar al menos un adoptante por WhatsApp antes de
                    completar la adopción.
                  </p>
                </div>
              </div>
            )}

            {/* Adoptante selection */}
            {!mutation.isSuccess && contactados.length > 0 && (
              <fieldset className="space-y-3">
                <legend className="text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
                  Seleccioná el adoptante
                </legend>
                <div className="space-y-2">
                  {contactados.map((c, i) => {
                    const { id } = resolveAdoptante(c);
                    return (
                      <div
                        key={c.id_match ?? id ?? i}
                        ref={i === 0 ? firstOptionRef : null}
                        tabIndex={-1}
                      >
                        <AdoptanteOption
                          candidato={c}
                          selected={
                            selectedCandidato?.id_match === c.id_match &&
                            selectedCandidato?.id_match != null
                              ? true
                              : selectedCandidato === c
                          }
                          onSelect={setSelectedCandidato}
                        />
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Observations textarea */}
            {!mutation.isSuccess && contactados.length > 0 && (
              <div className="space-y-2">
                <label
                  htmlFor="adopcion-observaciones"
                  className="text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-gray-400"
                >
                  Observaciones{" "}
                  <span className="font-normal normal-case tracking-normal text-gray-300">
                    (opcional)
                  </span>
                </label>
                <textarea
                  id="adopcion-observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={mutation.isPending}
                  rows={3}
                  maxLength={500}
                  placeholder="Ej: Adoptante con experiencia previa con perros. Visita pactada para el viernes."
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 transition-all duration-200 resize-none",
                    "focus:outline-none focus:bg-white focus:border-[#8b9e7e] focus:ring-2 focus:ring-[#8b9e7e]/15",
                    "placeholder:text-gray-300 disabled:opacity-50"
                  )}
                />
                <p className="text-[9px] text-gray-300 text-right">
                  {observaciones.length}/500
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {!mutation.isSuccess && (
            <div className="px-8 py-5 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100 flex gap-3">
              <button
                onClick={onClose}
                disabled={mutation.isPending}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all duration-150 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={!canSubmit || contactados.length === 0}
                aria-disabled={!canSubmit || contactados.length === 0}
                className={cn(
                  "flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]",
                  canSubmit && contactados.length > 0
                    ? "bg-[#8b9e7e] hover:bg-[#7d9070] text-white shadow-lg shadow-[#8b9e7e]/25 hover:shadow-[#8b9e7e]/35"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                {mutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Heart size={16} />
                )}
                {mutation.isPending ? "Registrando..." : "Confirmar Adopción"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
