"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, X, Loader2 } from "lucide-react";

import {
  getNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from "@/features/shared/services/notificacion.service";

function formatFecha(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

/**
 * NotificationsModal
 *
 * Beautiful modal that shows the user's notifications without leaving the current page.
 * Follows the PetDetailModal pattern: backdrop animation, scale/fade, rounded-3xl, responsive.
 * Full-screen on mobile, centered modal on desktop.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {'adoptante'|'albergue'} props.role - User role for routing
 * @param {Function} [props.onMascotaClick] - Callback for adoptante mascota notifications (opens PetDetailModal)
 */
export default function NotificationsModal({ isOpen, onClose, role = "adoptante", onMascotaClick }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // ---------- queries ----------
  const { data: notifData, isLoading } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: () => getNotificaciones({ soloNoLeidas: false }),
    enabled: isOpen,
  });

  const marcarLeidaMut = useMutation({
    mutationFn: marcarLeida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
      queryClient.invalidateQueries({ queryKey: ["notificaciones", "noLeidas"] });
    },
  });

  const marcarTodasMut = useMutation({
    mutationFn: marcarTodasLeidas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
      queryClient.invalidateQueries({ queryKey: ["notificaciones", "noLeidas"] });
    },
  });

  const notificaciones = notifData?.data ?? [];
  const noLeidas = notifData?.total_no_leidas ?? 0;

  // ---------- navigate to detail ----------
  const handleVerDetalles = (notif, notifId) => {
    if (notif.recurso_tipo === "match" && notif.recurso_id) {
      marcarLeidaMut.mutate(notifId);
      if (role === "albergue") {
        router.push(`/albergue/candidatos?match=${notif.recurso_id}`);
      } else {
        router.push(`/adoptante/matches/${notif.recurso_id}`);
      }
      onClose?.();
    } else if (notif.recurso_tipo === "mascota" && notif.recurso_id) {
      marcarLeidaMut.mutate(notifId);
      if (role === "albergue") {
        router.push(`/albergue/mascotas/${notif.recurso_id}/estado`);
      } else if (onMascotaClick) {
        onMascotaClick(notif.recurso_id);
      } else {
        router.push("/adoptante/descubrir");
      }
      onClose?.();
    } else if (notif.recurso_tipo === "adopcion") {
      marcarLeidaMut.mutate(notifId);
      if (role === "albergue") {
        router.push("/albergue/adopciones");
      } else {
        router.push("/adoptante/matches");
      }
      onClose?.();
    }
  };

  // ---------- render ----------
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="notif-modal"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white shadow-2xl overflow-hidden w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-md rounded-none sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---------- Header ---------- */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
                <h2 className="text-lg font-bold text-gray-900">Notificaciones</h2>
                {noLeidas > 0 && (
                  <span className="bg-[#5e924e]/10 text-[#5e924e] text-xs font-semibold px-2 py-0.5 rounded-full">
                    {noLeidas}
                  </span>
                )}
              </div>

              {notificaciones.length > 0 && noLeidas > 0 && (
                <button
                  onClick={() => marcarTodasMut.mutate()}
                  disabled={marcarTodasMut.isPending}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#5e924e] hover:text-[#3d6b30] transition-colors disabled:opacity-50"
                >
                  <CheckCheck size={15} />
                  Leer todas
                </button>
              )}
            </div>

            {/* ---------- Content ---------- */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 64px)" }}>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="animate-spin text-[#5e924e]" />
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-14 h-14 rounded-full bg-[#a9c99a]/20 flex items-center justify-center mb-4">
                    <Bell size={26} className="text-[#5e924e]" />
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">No tienes notificaciones</p>
                  <p className="text-gray-400 text-xs mt-1 text-center">
                    Cuando recibas notificaciones aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notificaciones.map((notif) => {
                    const isPendiente = notif.leida === false;
                    const notifId = notif.id_notificacion ?? notif.id;

                    return (
                      <div
                        key={notifId}
                        className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                          isPendiente ? "bg-[#fafaf8]" : "bg-white"
                        }`}
                      >
                        {/* Unread indicator */}
                        <div className="mt-1.5 shrink-0">
                          {isPendiente ? (
                            <span className="block w-2.5 h-2.5 rounded-full bg-[#5e924e]" />
                          ) : (
                            <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${
                              isPendiente ? "text-gray-900 font-medium" : "text-gray-500"
                            }`}
                          >
                            {notif.mensaje || "Sin contenido"}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-gray-400">
                              {formatFecha(notif.fecha_creacion)}
                            </span>

                            {/* Ver detalles — match, mascota, y adopcion */}
                            {notif.recurso_tipo && notif.recurso_id && notif.recurso_tipo !== 'adopcion' && (
                              <button
                                onClick={() => handleVerDetalles(notif, notifId)}
                                className="text-xs font-medium text-[#5e924e] hover:text-[#3d6b30] hover:underline transition-colors"
                              >
                                Ver detalles
                              </button>
                            )}
                            {notif.recurso_tipo === 'adopcion' && (
                              <button
                                onClick={() => handleVerDetalles(notif, notifId)}
                                className="text-xs font-medium text-[#5e924e] hover:text-[#3d6b30] hover:underline transition-colors"
                              >
                                Ver detalles
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Mark as read */}
                        {isPendiente && (
                          <button
                            onClick={() => marcarLeidaMut.mutate(notifId)}
                            disabled={marcarLeidaMut.isPending}
                            className="shrink-0 p-1.5 text-gray-400 hover:text-[#5e924e] hover:bg-[#a9c99a]/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Marcar como leída"
                          >
                            <CheckCheck size={15} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop close button (absolute top-right) */}
            <button
              onClick={onClose}
              className="hidden sm:flex absolute top-4 right-4 w-8 h-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
