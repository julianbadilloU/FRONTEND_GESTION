"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import MascotaEstadoForm from "./MascotaEstadoForm";

/**
 * MascotaEstadoModal — modal para cambiar el estado de una mascota.
 *
 * Props:
 *  - mascotaId: string | number — ID de la mascota
 *  - onClose: () => void — se llama al cerrar el modal
 *  - onSuccess: () => void — se llama después de un cambio de estado exitoso
 *
 * Sigue el mismo patrón que PetDetailModal: backdrop, Escape, X button,
 * rounded-3xl en desktop, full-screen en mobile.
 */
export default function MascotaEstadoModal({ mascotaId, onClose, onSuccess }) {
  useEffect(() => {
    if (!mascotaId) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [mascotaId]);

  useEffect(() => {
    if (!mascotaId) return;
    function handleKeyDown(e) { if (e.key === "Escape") onClose?.(); }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mascotaId, onClose]);

  return (
    <AnimatePresence>
      {mascotaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          {/* Backdrop - fast fade */}
          <motion.div
            key="mascota-estado-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel - fast scale + rounded */}
          <motion.div
            key="mascota-estado-modal"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white shadow-2xl overflow-hidden w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg md:max-w-xl rounded-none sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable content */}
            <div className="h-full sm:max-h-[92vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>

              <div className="pt-16 pb-8 sm:px-6 sm:pt-6">
                <div className="bg-[#f0ede8] rounded-3xl p-8 sm:p-10 shadow-sm border border-[#e5e0d8]">
                  <MascotaEstadoForm
                    mascotaId={mascotaId}
                    onSuccess={() => {
                      onSuccess?.();
                      onClose?.();
                    }}
                    onCancel={onClose}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
