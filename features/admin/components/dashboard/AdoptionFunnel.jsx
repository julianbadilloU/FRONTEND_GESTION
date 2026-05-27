"use client";

/**
 * AdoptionFunnel — SVG funnel chart for mascota adoption stages.
 *
 * Props:
 *   data: [{ label: string, count: number, color?: string }, ...]
 *         Expected stages: disponible → en_proceso → adoptado
 */
export function AdoptionFunnel({ data }) {
  if (!data || data.length === 0) return null;

  // Stage-to-stage conversion: each stage's % is relative to first stage (disponible)
  const firstCount = Math.max(data[0]?.count ?? 0, 1);

  // Colors: green gradient for adoption stages
  const DEFAULT_COLORS = ["#c9d6b6", "#a8c090", "#8b9e7e"];

  const STAGE_LABELS = {
    disponible: "Disponible",
    en_proceso: "En proceso",
    adoptado: "Adoptado",
  };

  const funnelData = data.map((d, i) => ({
    label: STAGE_LABELS[d.label] ?? d.label,
    count: d.count ?? 0,
    pct: Math.round(((d.count ?? 0) / firstCount) * 100),
    color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  // SVG trapezoid dimensions
  const viewWidth = 280;
  const viewHeight = 220;
  const topWidth = 200;
  const bottomWidth = 80;
  const stageH = Math.floor(viewHeight / funnelData.length);
  const halfDiff = (topWidth - bottomWidth) / 2;
  const step = halfDiff / funnelData.length; // shrink per stage

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">
        Embudo de Adopción
      </p>
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="w-full max-w-[280px] mx-auto"
        role="img"
        aria-label="Embudo de adopción: muestra las etapas del proceso de adopción"
      >
        {funnelData.map((d, i) => {
          const y = i * stageH;
          const w1 = topWidth - i * step * 2;
          const w2 = topWidth - (i + 1) * step * 2;
          const x1 = (viewWidth - w1) / 2;
          const x2 = (viewWidth - w2) / 2;

          const path = `
            M ${x1} ${y}
            L ${x1 + w1} ${y}
            L ${x2 + w2} ${y + stageH}
            L ${x2} ${y + stageH}
            Z
          `;

          return (
            <g key={d.label}>
              <path d={path} fill={d.color} opacity={0.85} stroke="#fff" strokeWidth={1} />
              <text
                x={viewWidth / 2}
                y={y + stageH / 2 - 4}
                textAnchor="middle"
                fill="#fff"
                fontSize="14"
                fontWeight="700"
              >
                {d.count}
              </text>
              <text
                x={viewWidth / 2}
                y={y + stageH / 2 + 12}
                textAnchor="middle"
                fill="rgba(255,255,255,0.85)"
                fontSize="10"
                fontWeight="600"
              >
                {d.pct}%
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 space-y-1.5">
        {funnelData.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-gray-600">{d.label}</span>
            </div>
            <span className="font-bold text-gray-900">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
