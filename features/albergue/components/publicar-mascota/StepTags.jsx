"use client";

import { cn } from "@/lib/utils/cn";
import { getOpcionesByCategoria } from "@/features/albergue/utils/mascota-tag-mapping";

// ── Mapa de emojis para opciones del backend (por valor de etiqueta) ──
const EMOJI_MAP = {
  // Tipo de animal
  Perro: "🐶",
  Gato: "🐱",
  // Edad
  Cachorro: "🐣",
  Joven: "⭐",
  Adulto: "🐾",
  Senior: "🔵",
  // Tamaño
  Pequeño: "🐾",
  Mediano: "🐕",
  Grande: "🦮",
  "Muy Grande": "🐘",
  // Sexo
  Macho: "♂️",
  Hembra: "♀️",
  // Color
  Negro: "⚫",
  Blanco: "🤍",
  Marrón: "🟤",
  Café: "🟤",
  Gris: "🩶",
  Naranja: "🟠",
  Anaranjado: "🟠",
  Mixto: "🌈",
  Multicolor: "🌈",
  // Energía
  Tranquilo: "😴",
  Moderado: "🏃",
  Energético: "⚡",
  "Muy Energético": "🔥",
  "Muy activo": "⚡",
  // Compatibilidad
  Niños: "👶",
  "Otros perros": "🐶",
  Gatos: "🐱",
  "Adultos mayores": "🧓",
  "Personas con discapacidad": "🧑‍🦽",
  // Condición especial
  "Sin condición": "✅",
  "Con discapacidad": "♿",
  "En tratamiento médico": "💊",
  Ninguna: "✅",
  "Medicación diaria": "💊",
  "Dieta especial": "🥗",
  "Movilidad reducida": "♿",
  // Salud
  Vacunado: "💉",
  Desparasitado: "🔬",
  Esterilizado: "🏥",
};

function getEmoji(label, fallback = "🏷️") {
  return EMOJI_MAP[label] ?? fallback;
}

// ── Componentes de presentación ──

function TagCard({ option, selected, onSelect, size = "normal" }) {
  const isSmall = size === "small";
  const emoji = option.emoji && option.emoji !== "🏷️"
    ? option.emoji
    : getEmoji(option.label);

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative group flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9e7e]/50",
        isSmall ? "p-3" : "p-4",
        selected
          ? "border-[#7a8e6e] bg-[#f0f5ec] shadow-md ring-2 ring-[#8b9e7e]/25"
          : "border-[#e0dbd4] bg-white hover:border-[#8b9e7e] hover:bg-[#fafaf8] hover:shadow-sm"
      )}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#8b9e7e] rounded-full flex items-center justify-center">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <span className={cn("leading-none select-none", isSmall ? "text-2xl" : "text-3xl")}>
        {emoji}
      </span>
      <span
        className={cn(
          "font-semibold text-center leading-tight",
          isSmall ? "text-[0.7rem]" : "text-xs",
          selected ? "text-[#4a6940]" : "text-gray-700"
        )}
      >
        {option.label}
      </span>
    </button>
  );
}

function PillTag({ option, selected, onSelect }) {
  const emoji = option.emoji && option.emoji !== "🏷️"
    ? option.emoji
    : getEmoji(option.label, "•");

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9e7e]/50",
        selected
          ? "border-[#7a8e6e] bg-[#f0f5ec] text-[#4a6940] shadow-sm ring-1 ring-[#8b9e7e]/20"
          : "border-[#e0dbd4] bg-white text-gray-700 hover:border-[#8b9e7e] hover:bg-[#fafaf8]"
      )}
    >
      <span className="text-base leading-none select-none">{emoji}</span>
      <span>{option.label}</span>
    </button>
  );
}

function CheckTag({ option, checked, onToggle }) {
  const emoji = option.emoji && option.emoji !== "🏷️"
    ? option.emoji
    : getEmoji(option.label, "•");

  return (
    <label
      className={cn(
        "flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-all duration-200",
        checked
          ? "border-[#7a8e6e] bg-[#f0f5ec]"
          : "border-[#e0dbd4] bg-white hover:border-[#8b9e7e] hover:bg-[#fafaf8]"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(option.id)}
        className="sr-only"
      />
      <div
        className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
          checked
            ? "bg-[#8b9e7e] border-[#8b9e7e]"
            : "border-[#c8c2b8] bg-white group-hover:border-[#8b9e7e]"
        )}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-base leading-none select-none">{emoji}</span>
      <span className={cn("text-sm font-medium", checked ? "text-[#4a6940]" : "text-gray-700")}>
        {option.label}
      </span>
    </label>
  );
}

function SectionLabel({ icon, children, required }) {
  return (
    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
      {icon && <span className="text-base">{icon}</span>}
      {children}
      {required && <span className="text-red-400 font-normal normal-case tracking-normal ml-0.5 text-xs">*</span>}
    </h3>
  );
}

function TagSection({ title, icon, required, children, hint }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon={icon} required={required}>
          {title}
        </SectionLabel>
        {hint && <span className="text-xs text-gray-400 italic">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <hr className="border-[#ede9e4]" />;
}

// ── Componente principal ──

export function StepTags({ tags, onTagChange, etiquetas = [], etiquetasLoading = false, etiquetasError = false }) {
  const handleSingleSelect = (key) => (value) => {
    onTagChange(key, tags[key] === value ? "" : value);
  };

  const handleMultiSelect = (key) => (value) => {
    const current = tags[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onTagChange(key, updated);
  };

  // Obtener opciones del backend con emojis aplicados
  const getDynamicOptions = (categorias) => {
    const ops = getOpcionesByCategoria(etiquetas, categorias);
    return ops.map((o) => ({ ...o, emoji: getEmoji(o.label) }));
  };

  // ─── Opciones por sección (100% backend-driven) ───
  const animalTypeOps = getDynamicOptions(["Tipo de animal"]) ?? [];
  const breedOps = getDynamicOptions(["Raza"]) ?? [];
  const ageOps = getDynamicOptions(["Edad"]) ?? [];
  const sizeOps = getDynamicOptions(["Tamaño"]) ?? [];
  const colorOps = getDynamicOptions(["Color"]) ?? [];
  const sexOps = getDynamicOptions(["Sexo"]) ?? [];
  const energyOps = getDynamicOptions(["Nivel de energía"]) ?? [];
  const compatOps = getDynamicOptions(["Compatibilidad"]) ?? [];
  const specialOps = getDynamicOptions(["Condición especial"]) ?? [];
  const healthOps = getDynamicOptions(["Estado de salud"]) ?? [];

  // ─── Estado de carga ───
  if (etiquetasLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 flex flex-col items-center justify-center text-gray-500">
        <div className="w-8 h-8 border-2 border-[#8b9e7e] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Cargando opciones…</p>
      </div>
    );
  }

  // ─── Estado de error ───
  if (etiquetasError) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 flex flex-col items-center justify-center text-amber-600">
        <span className="text-3xl mb-3">⚠️</span>
        <p className="text-sm font-medium">No se pudieron cargar las opciones de etiquetas.</p>
        <p className="text-xs text-gray-500 mt-1">Recargá la página e intentá de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-7">

      {/* ── Tipo de animal ── */}
      {animalTypeOps.length > 0 && (
        <TagSection title="Tipo de animal" icon="🐾" required>
          <div className="grid grid-cols-2 gap-3 max-w-[14rem]">
            {animalTypeOps.map((opt) => (
              <TagCard
                key={opt.id}
                option={opt}
                selected={tags.animalType === opt.id}
                onSelect={handleSingleSelect("animalType")}
              />
            ))}
          </div>
        </TagSection>
      )}

      {/* ── Sexo ── */}
      {sexOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Sexo" icon="⚧" required>
            <div className="grid grid-cols-2 gap-3 max-w-[14rem]">
              {sexOps.map((opt) => (
                <TagCard
                  key={opt.id}
                  option={opt}
                  selected={tags.sex === opt.id}
                  onSelect={handleSingleSelect("sex")}
                />
              ))}
            </div>
          </TagSection>
        </>
      )}

      {/* ── Edad ── */}
      {ageOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Edad" icon="📅" required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ageOps.map((opt) => (
                <TagCard
                  key={opt.id}
                  option={opt}
                  selected={tags.age === opt.id}
                  onSelect={handleSingleSelect("age")}
                />
              ))}
            </div>
          </TagSection>
        </>
      )}

      {/* ── Tamaño ── */}
      {sizeOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Tamaño" icon="📏">
            <div className="grid grid-cols-3 gap-3 max-w-xs">
              {sizeOps.map((opt) => (
                <TagCard
                  key={opt.id}
                  option={opt}
                  selected={tags.size === opt.id}
                  onSelect={handleSingleSelect("size")}
                />
              ))}
            </div>
          </TagSection>
        </>
      )}

      {/* ── Raza ── */}
      {breedOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Raza" icon="🔍">
            <div className="relative max-w-sm">
              <select
                value={tags.breed || ""}
                onChange={(e) => onTagChange("breed", e.target.value)}
                className="w-full border border-[#e0dbd4] rounded-xl py-3 px-4 pr-10 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#a9c99a] focus:border-[#8b9e7e] appearance-none cursor-pointer transition-colors hover:border-[#8b9e7e]"
              >
                <option value="">Seleccioná una raza</option>
                {breedOps.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* Flecha custom */}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </TagSection>
        </>
      )}

      {/* ── Color ── */}
      {colorOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Color" icon="🎨">
            <div className="flex flex-wrap gap-2">
              {colorOps.map((opt) => (
                <PillTag
                  key={opt.id}
                  option={opt}
                  selected={tags.color === opt.id}
                  onSelect={handleSingleSelect("color")}
                />
              ))}
            </div>
          </TagSection>
        </>
      )}

      {/* ── Nivel de energía ── */}
      {energyOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Nivel de energía" icon="⚡">
            <div className="grid grid-cols-3 gap-3 max-w-sm">
              {energyOps.map((opt) => (
                <TagCard
                  key={opt.id}
                  option={opt}
                  selected={tags.energy === opt.id}
                  onSelect={handleSingleSelect("energy")}
                />
              ))}
            </div>
          </TagSection>
        </>
      )}

      {/* ── Compatibilidad ── */}
      {compatOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Compatibilidad" icon="🤝" hint="Seleccioná todo lo que aplique">
            <div className="flex flex-wrap gap-2">
              {compatOps.map((opt) => (
                <PillTag
                  key={opt.id}
                  option={opt}
                  selected={(tags.compatibility || []).includes(opt.id)}
                  onSelect={handleMultiSelect("compatibility")}
                />
              ))}
            </div>
          </TagSection>
        </>
      )}

      {/* ── Condición especial ── */}
      {specialOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Condición especial" icon="📋">
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {specialOps.map((opt) => (
                <TagCard
                  key={opt.id}
                  option={opt}
                  selected={tags.specialCondition === opt.id}
                  onSelect={handleSingleSelect("specialCondition")}
                  size="small"
                />
              ))}
            </div>
          </TagSection>
        </>
      )}

      {/* ── Estado de salud ── */}
      {healthOps.length > 0 && (
        <>
          <Divider />
          <TagSection title="Estado de salud" icon="🏥" hint="Seleccioná todo lo que aplique">
            <div className="space-y-2">
              {healthOps.map((opt) => (
                <CheckTag
                  key={opt.id}
                  option={opt}
                  checked={(tags.healthStatus || []).includes(opt.id)}
                  onToggle={handleMultiSelect("healthStatus")}
                />
              ))}
            </div>
          </TagSection>
        </>
      )}

    </div>
  );
}
