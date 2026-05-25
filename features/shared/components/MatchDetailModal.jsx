"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MatchDetailContent } from "@/features/adoptante/components/matches/MatchDetail";
import { getMatchById } from "@/features/adoptante/services/match.service";

export default function MatchDetailModal({ matchId, onClose }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["matchDetalle", matchId],
    queryFn: () => getMatchById(matchId),
    enabled: !!matchId,
  });

  const matchData = data?.data ?? null;

  useEffect(() => {
    if (!matchId) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    function handleKeyDown(e) { if (e.key === "Escape") onClose?.(); }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [matchId, onClose]);

  return (
    <AnimatePresence>
      {matchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          {/* Backdrop - fast fade */}
          <motion.div
            key="match-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel - fast scale + rounded */}
          <motion.div
            key="match-detail-modal"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white shadow-2xl overflow-hidden w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg md:max-w-xl lg:max-w-2xl rounded-none sm:rounded-3xl"
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

              <div className="pt-12 pb-8 sm:px-2 sm:pt-4">
                {isLoading ? (
                  <div className="p-6 space-y-4 animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-2xl" />
                    <div className="h-24 bg-gray-100 rounded-xl" />
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <p className="text-red-500 font-medium">
                      No se pudo cargar el detalle del match.
                    </p>
                  </div>
                ) : matchData ? (
                  <MatchDetailContent matchData={matchData} />
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
