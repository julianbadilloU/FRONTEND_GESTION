"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import Link from "next/link";

import PetDetailModal from "@/features/shared/components/PetDetailModal";
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

export default function NotificacionesPage() {
  const queryClient = useQueryClient();
  const [selectedMascotaId, setSelectedMascotaId] = useState(null);

  const { data: notifData, isLoading } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: () => getNotificaciones({ soloNoLeidas: false }),
  });

  const marcarLeidaMut = useMutation({
    mutationFn: marcarLeida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
    },
  });

  const marcarTodasMut = useMutation({
    mutationFn: marcarTodasLeidas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] });
    },
  });

  const notificaciones = notifData?.data ?? [];
  const noLeidas = notifData?.total_no_leidas ?? 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#8b9e7e]" />
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            {noLeidas > 0
              ? `Tienes ${noLeidas} notificación(es) sin leer`
              : "No tienes notificaciones nuevas"}
          </p>
        </div>

        {notificaciones.length > 0 && noLeidas > 0 && (
          <button
            onClick={() => marcarTodasMut.mutate()}
            disabled={marcarTodasMut.isPending}
            className="flex items-center gap-2 text-sm font-medium text-[#81af6d] hover:text-[#5e924e] transition-colors disabled:opacity-50"
          >
            <CheckCheck size={18} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      {notificaciones.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-100 text-center">
          <Bell size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 font-medium">No tienes notificaciones.</p>
          <p className="text-gray-400 text-sm mt-1">
            Cuando recibas notificaciones aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificaciones.map((notif) => {
            const isPendiente = notif.leida === false;
            const notifId = notif.id_notificacion ?? notif.id;

            return (
              <div
                key={notifId}
                className={`
                  flex items-start gap-4 p-4 rounded-xl border transition-colors
                  ${isPendiente
                    ? "bg-[#fafaf8] border-[#e4d5c4]"
                    : "bg-white border-gray-100 opacity-70"
                  }
                `}
              >
                {/* Indicador de no leído */}
                <div className="mt-1.5 shrink-0">
                  {isPendiente ? (
                    <span className="block w-2.5 h-2.5 rounded-full bg-[#e07a5f]" />
                  ) : (
                    <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`
                      text-sm leading-relaxed
                      ${isPendiente ? "text-gray-900 font-medium" : "text-gray-500"}
                    `}
                  >
                    {notif.mensaje || "Sin contenido"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatFecha(notif.fecha_creacion)}
                  </p>

                  {/* Link al recurso según su tipo */}
                  {notif.recurso_tipo === 'match' && notif.recurso_id && (
                    <Link
                      href={`/adoptante/matches/${notif.recurso_id}`}
                      className="text-xs text-[#81af6d] hover:underline mt-1 inline-block"
                    >
                      Ver detalles
                    </Link>
                  )}
                  {notif.recurso_tipo === 'mascota' && notif.recurso_id && (
                    <button
                      onClick={() => setSelectedMascotaId(notif.recurso_id)}
                      className="text-xs text-[#81af6d] hover:underline mt-1 inline-block text-left"
                    >
                      Ver detalles
                    </button>
                  )}
                  {notif.recurso_tipo === 'adopcion' && (
                    <Link
                      href="/adoptante/matches"
                      className="text-xs text-[#81af6d] hover:underline mt-1 inline-block"
                    >
                      Ver detalles
                    </Link>
                  )}
                </div>

                {/* Acción: marcar como leída */}
                {isPendiente && (
                  <button
                    onClick={() => marcarLeidaMut.mutate(notifId)}
                    disabled={marcarLeidaMut.isPending}
                    className="shrink-0 p-2 text-gray-400 hover:text-[#81af6d] hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Marcar como leída"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    <PetDetailModal
      mascotaId={selectedMascotaId}
      onClose={() => setSelectedMascotaId(null)}
    />
    </>
  );
}
