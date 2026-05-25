/**
 * MatchDetail
 * Panel/sección de detalle de un match individual.
 * Usado en app/adoptante/matches/[id]/page.jsx
 * HU-MCH-03 – Sprint 4
 */

"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Heart,
  Dog,
  History,
} from "lucide-react";
import { CompatibilityBar } from "@/features/adoptante/components/feed/CompatibilityBadge";
import { EstadoBadge } from "@/features/adoptante/components/matches/MatchCard";

// ─── Mensaje por estado ───────────────────────────────────────────────────────

const ESTADO_MENSAJES = {
  adoptado: {
    icon: Heart,
    color: "text-[#4a7c59]",
    bg: "bg-[#e8f0e4]",
    titulo: "¡Felicitaciones! 🎉",
    texto:
      "Este match resultó en una adopción exitosa. ¡Gracias por dar un hogar a esta mascota!",
  },
  aceptado: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    titulo: "Match aceptado",
    texto:
      "El albergue ha aceptado tu solicitud. Contáctalos para coordinar el proceso de adopción.",
  },
  rechazado: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    titulo: "Match rechazado",
    texto:
      "Lamentablemente el albergue no pudo procesar este match. Te invitamos a explorar otras mascotas.",
  },
  pendiente: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    titulo: "En espera de respuesta",
    texto:
      "Tu solicitud está siendo revisada por el albergue. Te notificaremos cuando haya una respuesta.",
  },
};

/**
 * Detalle completo de un match.
 *
 * @param {{ matchData: object, isLoading: boolean, error: Error|null }} props
 */
export function MatchDetail({ matchData, isLoading, error }) {
  const router = useRouter();

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !matchData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 font-medium">No se pudo cargar el detalle del match.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-gray-500 underline"
        >
          Volver al historial
        </button>
      </div>
    );
  }

  const { mascota, albergue, estado, puntaje_compatibilidad, fecha_match, contactos } = matchData;
  const foto = mascota?.fotos?.[0]?.url ?? null;  // fotos es array de {id_foto, url, orden}
  const pct = puntaje_compatibilidad ?? null;
  const msgConfig = ESTADO_MENSAJES[estado] ?? ESTADO_MENSAJES.pendiente;
  const MsgIcon = msgConfig.icon;

  const handleWhatsApp = () => {
    if (albergue?.whatsapp) {
      const numero = albergue.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${numero}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Botón volver */}
      <button
        id="btn-volver-matches"
        onClick={() => router.push("/adoptante/matches")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Volver al historial
      </button>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Foto - más grande */}
        <div className="relative h-80 sm:h-96 bg-gray-100">
          {foto ? (
            <img
              src={foto}
              alt={mascota?.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <Dog size={64} />
            </div>
          )}
          {/* Estado sobre la foto */}
          <div className="absolute top-4 right-4">
            <EstadoBadge estado={estado} />
          </div>
        </div>

        {/* Información */}
        <div className="p-6 space-y-4">
          {/* Nombre y albergue */}
          <div>
            <h1
              id="match-detail-nombre"
              className="text-2xl font-bold text-gray-900"
            >
              {mascota?.nombre}
            </h1>
            <p className="text-sm text-[#7a9e6a] font-medium mt-0.5">
              {albergue?.nombre_albergue}
            </p>
          </div>

          {/* Fecha */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar size={14} />
            <span>
              Match realizado el{" "}
              {new Date(fecha_match).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Estado de la mascota */}
          {mascota?.estado_adopcion && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Estado de la mascota:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                mascota.estado_adopcion === "disponible"  ? "bg-emerald-50 text-emerald-700" :
                mascota.estado_adopcion === "en_proceso"  ? "bg-blue-50 text-blue-700" :
                mascota.estado_adopcion === "adoptado"    ? "bg-[#e8f0e4] text-[#4a7c59]" :
                "bg-gray-100 text-gray-500"
              }`}>
                {mascota.estado_adopcion.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* Barra de compatibilidad */}
          {pct !== null && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Compatibilidad
              </p>
              <CompatibilityBar pct={pct} />
            </div>
          )}

          {/* Tags de la mascota */}
          {mascota?.tags?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Características
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mascota.tags.filter(t => !(t.nombre_tag === "Raza" && t.valor === "Otra")).slice(0, 8).map((t, i) => {
                  const colors = ["bg-[#e8a55a]", "bg-[#f0c97a]", "bg-[#e8b8c4]", "bg-[#b8d8a8]", "bg-[#a3c9e8]", "bg-[#d4b8e8]", "bg-[#e8d4a5]", "bg-[#a8d8c8]"];
                  return (
                    <span key={i} className={`px-3 py-1 text-[11px] font-semibold rounded-full text-white shadow-sm ${colors[i % colors.length]}`}>
                      {t.nombre_tag}: {t.valor}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

      {/* Mensaje por estado */}
        <div
          id="match-detail-mensaje"
          className={`flex items-start gap-3 p-4 rounded-xl ${msgConfig.bg}`}
          aria-live="polite"
        >
          <MsgIcon size={20} className={`shrink-0 mt-0.5 ${msgConfig.color}`} />
          <div>
            <p className={`font-semibold text-sm ${msgConfig.color}`}>
              {msgConfig.titulo}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">{msgConfig.texto}</p>
          </div>
        </div>

        {/* Historial de contactos */}
        {contactos && contactos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History size={12} /> Historial de contactos
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {contactos.map((c) => (
                <div key={c.id_contacto} className="flex items-start gap-3">
                  <MessageCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{c.mensaje || "Contacto vía WhatsApp"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(c.fecha).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {c.estado && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          {c.estado}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Botón WhatsApp */}
          {albergue?.whatsapp && (
            <button
              id="btn-whatsapp-detail"
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <MessageCircle size={18} />
              Contactar al albergue por WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
