/**
 * CompatibilityBadge
 * Muestra el porcentaje de compatibilidad con estilos visuales
 * según el nivel: alto (≥80%), medio (50–79%), bajo (<50%).
 *
 * Sprint 4 – HU-MT-01: Motor de matching por tags
 */

import { Zap, TrendingUp, Minus } from "lucide-react";

/**
 * Retorna la configuración visual según el nivel de compatibilidad.
 * @param {number} pct - Porcentaje 0-100
 */
export function getCompatibilityLevel(pct) {
  if (pct >= 80) {
    return {
      level: "alto",
      label: "Alta compatibilidad",
      badgeBg: "bg-[#4a7c59]",
      badgeText: "text-white",
      barColor: "bg-[#4a7c59]",
      ringColor: "ring-[#4a7c59]/30",
      icon: Zap,
      glowClass: "shadow-[0_0_12px_rgba(74,124,89,0.45)]",
    };
  }
  if (pct >= 50) {
    return {
      level: "medio",
      label: "Buena compatibilidad",
      badgeBg: "bg-[#d4841b]",
      badgeText: "text-white",
      barColor: "bg-[#d4841b]",
      ringColor: "ring-[#d4841b]/30",
      icon: TrendingUp,
      glowClass: "shadow-[0_0_12px_rgba(212,132,27,0.35)]",
    };
  }
  return {
    level: "bajo",
    label: "Compatibilidad baja",
    badgeBg: "bg-gray-500",
    badgeText: "text-white",
    barColor: "bg-gray-400",
    ringColor: "ring-gray-400/20",
    icon: Minus,
    glowClass: "",
  };
}

/**
 * Badge compacto para mostrar sobre la foto de la tarjeta.
 * @param {{ pct: number }} props
 */
export function CompatibilityBadge({ pct }) {
  if (pct === null || pct === undefined) return null;

  const { badgeBg, badgeText, icon: Icon, glowClass } = getCompatibilityLevel(pct);

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${badgeBg} ${badgeText} ${glowClass}`}
      aria-label={`${pct}% de compatibilidad`}
      title={`${pct}% de compatibilidad`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {pct}% match
    </div>
  );
}

/**
 * Barra de progreso de compatibilidad para mostrar dentro de la tarjeta.
 * @param {{ pct: number }} props
 */
export function CompatibilityBar({ pct }) {
  if (pct === null || pct === undefined) return null;

  const { barColor, label } = getCompatibilityLevel(pct);

  return (
    <div className="mt-1" aria-label={label}>
      {/* Etiqueta + número */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Match
        </span>
        <span className="text-[10px] font-bold text-gray-600">{pct}%</span>
      </div>
      {/* Track */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
