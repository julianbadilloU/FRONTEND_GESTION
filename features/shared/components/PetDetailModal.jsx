"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import PetDetailContent from "@/features/shared/components/PetDetailContent";

/**
 * PetDetailModal — modal flotante reutilizable que muestra el detalle de una mascota.
 *
 * Props:
 *  - mascotaId: string | number — ID de la mascota a mostrar
 *  - onClose: () => void — callback al cerrar el modal
 */
export default function PetDetailModal({ mascotaId, onClose }) {
  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (!mascotaId) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mascotaId]);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!mascotaId) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mascotaId, onClose]);

  return (
    <AnimatePresence>
      {mascotaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            key="pet-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="pet-detail-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative bg-white shadow-2xl overflow-auto"
            style={{
              // mobile: pantalla completa; desktop: modal centrado con borde redondeado
              width: "100%",
              height: "100%",
              maxWidth: "48rem",
              maxHeight: "90vh",
              borderRadius: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ajustar bordes redondeados en desktop via media query con className condicional */}
            <style>{`
              @media (min-width: 640px) {
                .pet-detail-modal-inner {
                  border-radius: 1rem !important;
                }
              }
            `}</style>
            <div className="pet-detail-modal-inner relative h-full w-full">
              {/* Scroll container */}
              <div className="h-full w-full overflow-y-auto">
                {/* Close button — fixed en mobile, absolute en desktop */}
                <button
                  onClick={onClose}
                  className="fixed sm:absolute top-4 right-4 z-30 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>

                <div className="px-4 pt-14 pb-8 sm:px-6 sm:pt-6">
                  <PetDetailContent mascotaId={mascotaId} showActions={true} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
