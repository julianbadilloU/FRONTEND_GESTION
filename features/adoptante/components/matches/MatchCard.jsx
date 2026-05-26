/**
 * MatchCard
 * Tarjeta de un match en el historial del adoptante.
 * HU-MCH-03 – Sprint 4
 */

"use client";

import { Dog, Cat, MapPin, Calendar, MessageCircle, ChevronRight } from "lucide-react";
import { CompatibilityBadge } from "@/features/adoptante/components/feed/CompatibilityBadge";

// ─── Configuración visual de estados ─────────────────────────────────────────

const ESTADO_CONFIG = {
  pendiente: {
    label: "Pendiente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  aceptado: {
    label: "Aceptado",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  rechazado: {
    label: "Rechazado",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  adoptado: {
    label: "Adoptado",
    bg: "bg-[#e8f0e4]",
    text: "text-[#4a7c59]",
    border: "border-[#4a7c59]/20",
    dot: "bg-[#4a7c59]",
  },
  en_adopcion: {
    label: "Adopción en proceso",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  adoptado_por_otro: {
    label: "Adoptado por otro",
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    dot: "bg-orange-400",
  },
  descartado: {
    label: "Descartado",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

/**
 * Badge del estado del match.
 */
export function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? {
    label: estado,
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
      aria-label={`Estado: ${cfg.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/**
 * Tarjeta de match individual.
 * Campos del backend (GET /api/match):
 *   - puntaje       : número de compatibilidad (en la lista)
 *   - fecha         : fecha del match (en la lista)
 *   - mascota.foto  : string directo con la URL de la foto (en la lista)
 *
 * @param {{
 *   match: {
 *     id_match: number,
 *     estado: string,
 *     puntaje: number,
 *     fecha: string,
 *     mascota: { id_mascota: number, nombre: string, foto: string },
 *     albergue: { nombre_albergue: string, whatsapp: string }
 *   },
 *   onClick: () => void
 * }} props
 */
export function MatchCard({ match, onClick }) {
  const { mascota, albergue, estado, puntaje, fecha } = match;
  const foto = mascota?.foto ?? null;          // string directo en la lista
  const pct = puntaje ?? null;

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (albergue?.whatsapp) {
      const numero = albergue.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${numero}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      id={`match-card-${match.id_match}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex gap-0 sm:gap-4"
      aria-label={`Match con ${mascota?.nombre}`}
    >
      {/* Foto mascota */}
      <div className="relative w-28 sm:w-36 shrink-0 bg-gray-100 overflow-hidden">
        {foto ? (
          <img
            src={foto}
            alt={mascota?.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[120px] text-gray-300">
            <Dog size={36} />
          </div>
        )}

        {/* Badge compatibilidad sobre la foto */}
        {pct !== null && (
          <div className="absolute bottom-2 left-2">
            <CompatibilityBadge pct={pct} />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        {/* Fila superior: nombre + estado */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-bold text-gray-900 text-base truncate">
            {mascota?.nombre}
          </h3>
          <EstadoBadge estado={estado} />
        </div>

        {/* Albergue */}
        <p className="text-sm text-[#7a9e6a] font-medium mt-1 truncate">
          {albergue?.nombre_albergue}
        </p>

        {/* Meta: fecha */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(fecha).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          {pct !== null && (
            <span className="font-semibold text-gray-500">{pct}% compatibilidad</span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          {albergue?.whatsapp ? (
            <button
              id={`btn-whatsapp-${match.id_match}`}
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              aria-label={`Contactar albergue ${albergue.nombre_albergue} por WhatsApp`}
            >
              <MessageCircle size={14} />
              Contactar albergue
            </button>
          ) : (
            <span />
          )}
          <ChevronRight
            size={16}
            className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </article>
  );
}
