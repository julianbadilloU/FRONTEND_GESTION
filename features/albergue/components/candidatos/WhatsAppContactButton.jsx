"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { contactarAdoptante, buildWhatsAppUrl } from "@/features/albergue/services/candidatos.service";

// ── WhatsApp SVG icon ──────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Confirmation Modal ─────────────────────────────────────────────────────────
function WhatsAppModal({ isOpen, onClose, onConfirm, loading, adoptante, mascota }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl space-y-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-modal-title"
          >
            {/* Icon */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                <WhatsAppIcon size={32} className="text-[#25D366]" />
              </div>
              <h2
                id="whatsapp-modal-title"
                className="text-xl font-bold text-gray-900"
              >
                Contactar por WhatsApp
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Se abrirá WhatsApp con un mensaje predefinido para{" "}
                <span className="font-semibold text-[#25D366]">
                  {adoptante?.nombre_completo}
                </span>{" "}
                sobre{" "}
                <span className="font-semibold text-gray-700">{mascota}</span>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                id="whatsapp-cancel-btn"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 text-sm font-bold text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="whatsapp-confirm-btn"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 text-sm font-bold text-white bg-[#25D366] hover:bg-[#1ebe5b] rounded-full shadow-md transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <WhatsAppIcon size={16} />
                )}
                {loading ? "Abriendo..." : "Abrir WhatsApp"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Main Button ────────────────────────────────────────────────────────────────
/**
 * WhatsAppContactButton
 *
 * Props:
 *   idMatch        — ID del match en la BD (para llamar al endpoint)
 *   adoptante      — { nombre_completo, whatsapp_adoptante }
 *   nombreMascota  — nombre de la mascota
 *   estadoInicial  — "pendiente" | "contactado" (del estado actual del match)
 *   onContactado   — callback(idMatch) cuando el contacto fue registrado
 *   className      — clases adicionales para el botón
 */
export function WhatsAppContactButton({
  idMatch,
  adoptante,
  nombreMascota,
  estadoInicial = "pendiente",
  onContactado,
  className = "",
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [estado, setEstado] = useState(estadoInicial);

  const yaContactado = estado === "contactado";

  const handleOpenModal = () => {
    if (yaContactado || loading) return;
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // 1. Registrar contacto en backend
      await contactarAdoptante(idMatch);

      // 2. Construir URL de WhatsApp y abrir en nueva pestaña (SOLO TRAS ÉXITO)
      const url = buildWhatsAppUrl(
        adoptante?.whatsapp,
        adoptante?.nombre_completo,
        nombreMascota
      );
      window.open(url, "_blank", "noopener,noreferrer");

      // 3. Actualizar estado visual
      setEstado("contactado");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // 4. Notificar al padre para actualizar lista e historial
      onContactado?.(idMatch);
      setShowModal(false);
    } catch (err) {
      // Manejar errores del backend y mostrar mensaje
      console.error("[WhatsAppContactButton] Error al registrar contacto:", err);
      
      // Intentar obtener mensaje de error del backend
      const errorMsg = err.response?.data?.message || "No se pudo registrar el contacto. Intenta de nuevo.";
      
      // Notificar al componente padre del error para mostrar en UI (toast)
      onContactado?.(idMatch, errorMsg);
      
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        id={`whatsapp-btn-${idMatch}`}
        onClick={handleOpenModal}
        disabled={loading || yaContactado}
        aria-label={
          yaContactado
            ? "Ya contactado por WhatsApp"
            : `Contactar a ${adoptante?.nombre_completo} por WhatsApp`
        }
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.97] select-none",
          yaContactado
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
            : loading
            ? "bg-[#25D366]/80 text-white cursor-not-allowed"
            : "bg-[#25D366] hover:bg-[#1ebe5b] text-white shadow-sm hover:shadow-md",
          className
        )}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin shrink-0" />
        ) : success || yaContactado ? (
          <Check size={15} className="shrink-0" />
        ) : (
          <WhatsAppIcon size={15} className="shrink-0" />
        )}
        <span>{yaContactado ? "Contactado" : "Contactar"}</span>
      </button>

      <WhatsAppModal
        isOpen={showModal}
        onClose={() => !loading && setShowModal(false)}
        onConfirm={handleConfirm}
        loading={loading}
        adoptante={adoptante}
        mascota={nombreMascota}
      />
    </>
  );
}

// Re-export icon for use in other components
export { WhatsAppIcon };
