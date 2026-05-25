"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationControls,
} from "framer-motion";
import { Cat, Dog } from "lucide-react";
import {
  CompatibilityBadge,
  getCompatibilityLevel,
} from "@/features/adoptante/components/feed/CompatibilityBadge";

const SWIPE_THRESHOLD = 120;
const EXIT_DISTANCE = 700;

function getEdadLabel(mascota) {
  const edadTag = mascota.tags?.find(
    (t) => t.nombre_tag === "Edad" || t.nombre_tag === "Rango de edad"
  );
  if (edadTag?.valor) return edadTag.valor;
  if (mascota.edad) return `${mascota.edad} años`;
  return null; // no mostrar si no hay dato
}

function getTipoIcon(mascota) {
  const tipoTag = mascota.tags?.find((t) => t.nombre_tag === "Tipo de animal");
  return tipoTag?.valor === "Gato" ? Cat : Dog;
}

function formatFecha(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

const TAG_PALETTE = [
  { bg: "bg-[#e8a55a]", text: "text-white" },
  { bg: "bg-[#f0c97a]", text: "text-white" },
  { bg: "bg-[#e8b8c4]", text: "text-white" },
  { bg: "bg-[#b8d8a8]", text: "text-white" },
  { bg: "bg-[#a3c9e8]", text: "text-white" },
];

function pickTags(mascota) {
  const all = mascota.tags || [];
  const preferred = all
    .filter((t) =>
      ["Raza", "Color", "Tamaño", "Tipo de animal", "Sexo", "Nivel de energía", "Compatibilidad"].includes(
        t.nombre_tag,
      ),
    )
    .slice(0, 6);
  if (preferred.length >= 4) return preferred;
  const filler = all.filter((t) => !preferred.includes(t)).slice(0, 6 - preferred.length);
  return [...preferred, ...filler];
}

/**
 * SwipeCard — tarjeta arrastrable estilo Tinder.
 *
 * Props:
 *  - mascota: objeto mascota
 *  - compatibilidad: número 0-100 o null
 *  - isTop: boolean (solo la top recibe drag y dispara onSwipe)
 *  - command: 'like' | 'skip' | null  → dispara salida programática
 *  - onSwipe: (direction) => void
 *  - onCardClick: () => void  (ver perfil completo)
 *  - stackIndex: posición en la pila (0=top, 1, 2…)
 */
export function SwipeCard({
  mascota,
  compatibilidad = null,
  isTop = false,
  command = null,
  onSwipe,
  onCardClick,
  stackIndex = 0,
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);
  const controls = useAnimationControls();
  const [imgLoaded, setImgLoaded] = useState(false);

  const TipoIcon = getTipoIcon(mascota);
  const tags = pickTags(mascota);
  const pct = compatibilidad;
  const level = pct !== null && pct !== undefined ? getCompatibilityLevel(pct) : null;

  // Aplicar estilos visuales según nivel de compatibilidad (HU-MT-01)
  const borderClass =
    level?.level === "alto"
      ? "border-4 border-[#4a7c59]/60 shadow-[0_0_20px_rgba(74,124,89,0.2)]"
      : level?.level === "bueno"
      ? "border-4 border-[#c9a52d]/60 shadow-[0_0_20px_rgba(201,165,45,0.2)]"
      : level?.level === "aceptable"
      ? "border-4 border-[#d4841b]/50 shadow-[0_0_20px_rgba(212,132,27,0.2)]"
      : "border border-gray-100 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.18)]";

  async function swipeOut(direction) {
    const targetX = direction === "like" ? EXIT_DISTANCE : -EXIT_DISTANCE;
    await controls.start({
      x: targetX,
      opacity: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    });
    onSwipe?.(direction);
  }

  useEffect(() => {
    if (!isTop || !command) return;
    swipeOut(command);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command, isTop]);

  function handleDragEnd(_event, info) {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset > SWIPE_THRESHOLD || velocity > 600) {
      swipeOut("like");
    } else if (offset < -SWIPE_THRESHOLD || velocity < -600) {
      swipeOut("skip");
    } else {
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 30 },
      });
    }
  }

  // Estilos según posición en el stack
  const stackStyles =
    stackIndex === 0
      ? { scale: 1, y: 0, rotate: 0, zIndex: 30 }
      : stackIndex === 1
      ? { scale: 0.96, y: 14, rotate: -2, zIndex: 20 }
      : { scale: 0.92, y: 28, rotate: 2, zIndex: 10 };

  return (
    <motion.div
      data-testid={isTop ? "swipe-card-top" : `swipe-card-${stackIndex}`}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={controls}
      initial={false}
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : stackStyles.rotate,
        zIndex: stackStyles.zIndex,
      }}
      whileTap={isTop ? { cursor: "grabbing" } : undefined}
      className="absolute inset-0 mx-auto select-none"
    >
      <motion.div
        animate={{
          scale: stackStyles.scale,
          y: stackStyles.y,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={`w-full h-full bg-white rounded-3xl overflow-hidden transition-colors duration-300 ${borderClass} ${
          isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
        }`}
      >
        {/* Imagen */}
        <div className="relative h-[58%] bg-gray-100 overflow-hidden">
          {mascota.foto ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              )}
              <img
                src={mascota.foto}
                alt={mascota.nombre}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                draggable={false}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 bg-gradient-to-br from-[#fdf0ec] to-[#e8f0e4]">
              <TipoIcon size={72} strokeWidth={1.4} />
            </div>
          )}

          {/* Badge de compatibilidad */}
          {pct !== null && pct !== undefined && (
            <div className="absolute top-4 right-4">
              <CompatibilityBadge pct={pct} />
            </div>
          )}

          {/* Botón "ver perfil" sutil */}
          {isTop && onCardClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCardClick();
              }}
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/85 backdrop-blur-sm rounded-full text-[11px] font-semibold text-gray-700 hover:bg-white transition-colors shadow-sm"
              data-testid="ver-perfil-btn"
            >
              Ver perfil
            </button>
          )}
        </div>

        {/* Cuerpo */}
        <div className="px-6 pt-4 pb-5 h-[42%] flex flex-col gap-2">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {mascota.nombre}
          </h3>

          <p className="text-xs text-gray-400">
            {getEdadLabel(mascota) && (
              <>
                <span className="font-medium">Edad:</span> {getEdadLabel(mascota)}
                <span className="mx-1.5 text-gray-300">·</span>
              </>
            )}
            {mascota.albergue?.nombre && (
              <span className="font-medium text-[#7a9e6a]">{mascota.albergue.nombre}</span>
            )}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {tags.map((t, i) => {
                const palette = TAG_PALETTE[i % TAG_PALETTE.length];
                return (
                  <span
                    key={`${t.nombre_tag}-${t.valor}-${i}`}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full ${palette.bg} ${palette.text} shadow-sm`}
                  >
                    {t.valor.length > 12 ? t.valor : `${t.nombre_tag}: ${t.valor}`}
                  </span>
                );
              })}
            </div>
          )}

          {mascota.descripcion && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
              {mascota.descripcion}
            </p>
          )}

          {level && (
            <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
              <span className={`w-2 h-2 rounded-full ${level.barColor}`} />
              {level.label}
            </div>
          )}
        </div>

        {/* Stamps LIKE / NOPE */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-10 left-8 pointer-events-none"
              data-testid="stamp-like"
            >
              <div className="px-6 py-2.5 border-[5px] border-[#5dd39e] rounded-2xl rotate-[-18deg]">
                <span className="text-[#5dd39e] text-4xl font-black tracking-widest">
                  LIKE
                </span>
              </div>
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-10 right-8 pointer-events-none"
              data-testid="stamp-nope"
            >
              <div className="px-6 py-2.5 border-[5px] border-[#f08a7a] rounded-2xl rotate-[18deg]">
                <span className="text-[#f08a7a] text-4xl font-black tracking-widest">
                  NOPE
                </span>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
