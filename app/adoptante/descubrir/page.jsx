"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Heart, X, Undo2, PawPrint, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import {
  getFeedMascotas,
  getMatchMascotas,
  registrarMeInteresa,
  registrarDescartar,
  deshacerRecomendacion,
} from "@/features/adoptante/services/adoptante.service";
import { SwipeCard } from "@/features/adoptante/components/feed/SwipeCard";

export const FEED_QUERY_KEY = ["feed", "swipe"];
export const MATCH_QUERY_KEY = ["match", "swipe"];

export default function DescubrirPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [command, setCommand] = useState(null);
  const [history, setHistory] = useState([]); // { idMascota, action }
  const [feedback, setFeedback] = useState(null);
  const isAnimating = useRef(false);

  const {
    data: feedData,
    isLoading: feedLoading,
    error: feedError,
    refetch: refetchFeed,
  } = useQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: () => getFeedMascotas({ page: 1, limit: 30 }),
  });

  const { data: matchData } = useQuery({
    queryKey: MATCH_QUERY_KEY,
    queryFn: getMatchMascotas,
    enabled: !feedLoading && !feedError,
    staleTime: 0,
  });

  const mascotas = feedData?.data || [];
  const compatMap = useMemo(() => {
    const map = new Map();
    matchData?.data?.forEach((m) => {
      if (m.id_mascota && m.compatibilidad !== undefined) {
        map.set(m.id_mascota, m.compatibilidad);
      }
    });
    return map;
  }, [matchData]);

  const visibleStack = mascotas.slice(index, index + 3);
  const hasMore = index < mascotas.length;

  // ── Acciones ─────────────────────────────────────────────────────────────────
  function triggerSwipe(direction) {
    if (isAnimating.current) return;
    if (!hasMore) return;
    isAnimating.current = true;
    setCommand(direction === "like" ? "like" : "skip");
  }

  async function handleSwipeComplete(direction) {
    const current = mascotas[index];
    if (!current) return;
    const action = direction === "like" ? "like" : "skip";
    setHistory((h) => [...h, { idMascota: current.id_mascota, action }]);
    setIndex((i) => i + 1);
    setCommand(null);
    isAnimating.current = false;

    try {
      if (action === "like") {
        await registrarMeInteresa(current.id_mascota);
        setFeedback({ type: "like", nombre: current.nombre });
      } else {
        await registrarDescartar(current.id_mascota);
      }
    } catch (e) {
      // Silencioso: la UI ya avanzó. Mostrar aviso ligero.
      setFeedback({ type: "error", message: "No se pudo registrar la acción." });
    }
  }

  async function handleUndo() {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setIndex((i) => Math.max(0, i - 1));
    setFeedback(null);
    try {
      if (last.action === "skip") {
        await deshacerRecomendacion(last.idMascota);
      }
      // si fue like: por ahora solo deshacemos visualmente (back-end gestiona el match aparte).
    } catch {
      /* noop */
    }
  }

  // Auto-clear feedback like
  useEffect(() => {
    if (feedback?.type === "like" || feedback?.type === "error") {
      const t = setTimeout(() => setFeedback(null), 2200);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // ── Render helpers ───────────────────────────────────────────────────────────
  return (
    <ClientAuthGuard allowedRoles={["adoptante"]}>
      <div className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-[#fafaf8] via-white to-[#f3f8ee] relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#a9c99a]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#e07a5f]/10 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-16">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Descubre{" "}
                <span className="font-serif italic font-normal text-[#81af6d]">
                  Mascotas
                </span>
              </h1>
              <p className="text-gray-500 text-sm mt-1.5">
                Desliza a la derecha si te interesa, a la izquierda para descartar.
              </p>
            </div>
            {history.length > 0 && (
              <span className="text-xs text-gray-400">
                Has revisado{" "}
                <span className="font-semibold text-gray-700">{history.length}</span>{" "}
                {history.length === 1 ? "mascota" : "mascotas"}
              </span>
            )}
          </div>

          {/* Contenido principal */}
          <div className="flex flex-col items-center">
            {feedLoading ? (
              <SkeletonStack />
            ) : feedError ? (
              <ErrorState onRetry={refetchFeed} />
            ) : !hasMore ? (
              <EmptyState onRefresh={refetchFeed} />
            ) : (
              <>
                {/* Stack de tarjetas */}
                <div
                  className="relative w-[340px] h-[520px] sm:w-[380px] sm:h-[560px]"
                  data-testid="swipe-stack"
                >
                  <AnimatePresence>
                    {visibleStack
                      .slice()
                      .reverse()
                      .map((m, revI) => {
                        const stackIndex = visibleStack.length - 1 - revI;
                        const isTop = stackIndex === 0;
                        return (
                          <SwipeCard
                            key={m.id_mascota}
                            mascota={m}
                            compatibilidad={compatMap.get(m.id_mascota) ?? null}
                            isTop={isTop}
                            stackIndex={stackIndex}
                            command={isTop ? command : null}
                            onSwipe={isTop ? handleSwipeComplete : undefined}
                            onCardClick={
                              isTop
                                ? () => router.push(`/mascota/${m.id_mascota}`)
                                : undefined
                            }
                          />
                        );
                      })}
                  </AnimatePresence>
                </div>

                {/* Botones */}
                <div className="mt-12 flex items-center justify-center gap-7">
                  <CircleButton
                    label="Descartar"
                    testId="btn-skip"
                    onClick={() => triggerSwipe("skip")}
                    color="#f08a7a"
                  >
                    <X size={28} strokeWidth={2.6} />
                  </CircleButton>

                  <CircleButton
                    label="Me interesa"
                    testId="btn-like"
                    onClick={() => triggerSwipe("like")}
                    color="#5dd39e"
                    big
                  >
                    <Heart size={32} strokeWidth={2.4} fill="#5dd39e" />
                  </CircleButton>
                </div>

                {/* Botón Deshacer (inferior izquierda) */}
                <motion.button
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: history.length > 0 ? 1 : 0.35, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  data-testid="btn-undo"
                  className="fixed bottom-8 left-8 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-md text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Undo2 size={16} className="text-[#e07a5f]" />
                  Deshacer
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Toast feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              {feedback.type === "like" ? (
                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-full shadow-xl border border-[#5dd39e]/30">
                  <div className="w-8 h-8 rounded-full bg-[#5dd39e]/15 flex items-center justify-center">
                    <Heart size={16} className="text-[#5dd39e]" fill="#5dd39e" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    ¡Mostraste interés en {feedback.nombre}!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-full shadow-xl border border-red-200">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {feedback.message}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ClientAuthGuard>
  );
}

// ─── Botón circular ───────────────────────────────────────────────────────────
function CircleButton({ children, onClick, color, label, testId, big = false }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      onClick={onClick}
      aria-label={label}
      data-testid={testId}
      className={`flex items-center justify-center rounded-full bg-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.15)] border-2 transition-colors ${
        big ? "w-20 h-20" : "w-16 h-16"
      }`}
      style={{ borderColor: color, color }}
    >
      {children}
    </motion.button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonStack() {
  return (
    <div className="relative w-[340px] h-[520px] sm:w-[380px] sm:h-[560px]">
      {[2, 1, 0].map((i) => (
        <div
          key={i}
          className="absolute inset-0 bg-white rounded-3xl border border-gray-100 shadow-md animate-pulse"
          style={{
            transform: `scale(${1 - i * 0.04}) translateY(${i * 14}px)`,
            opacity: 1 - i * 0.25,
            zIndex: 30 - i,
          }}
        >
          <div className="h-[58%] bg-gray-100" />
          <div className="p-6 space-y-3">
            <div className="h-6 w-2/3 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
              <div className="h-5 w-14 bg-gray-100 rounded-full" />
              <div className="h-5 w-14 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Estado fin del feed ──────────────────────────────────────────────────────
function EmptyState({ onRefresh }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-testid="empty-state"
      className="w-[340px] sm:w-[420px] text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm"
    >
      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#e8f0e4] flex items-center justify-center">
        <PawPrint size={36} className="text-[#81af6d]" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        ¡Has visto todas las mascotas!
      </h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Vuelve más tarde para descubrir nuevas publicaciones, o amplía tus
        preferencias para encontrar más coincidencias.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#81af6d] text-white rounded-full text-sm font-semibold hover:bg-[#6f9b5d] transition-colors shadow-sm"
        >
          <RefreshCw size={15} />
          Recargar feed
        </button>
        <a
          href="/adoptante/perfil"
          className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Editar preferencias
        </a>
      </div>
    </motion.div>
  );
}

// ─── Estado de error ──────────────────────────────────────────────────────────
function ErrorState({ onRetry }) {
  return (
    <div
      data-testid="error-state"
      className="w-[340px] sm:w-[420px] text-center py-16 px-6 bg-white rounded-3xl border border-red-100 shadow-sm"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        No se pudo cargar el feed
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        Verifica tu conexión e intenta nuevamente.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        <RefreshCw size={15} />
        Reintentar
      </button>
    </div>
  );
}
