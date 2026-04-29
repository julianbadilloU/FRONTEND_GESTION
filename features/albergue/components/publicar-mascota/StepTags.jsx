"use client";

import { cn } from "@/lib/utils/cn";
import {
  ANIMAL_TYPE_OPTIONS,
  BREED_OPTIONS,
  AGE_OPTIONS,
  SIZE_OPTIONS,
  COLOR_OPTIONS,
  SEX_OPTIONS,
  ENERGY_OPTIONS,
  COMPATIBILITY_OPTIONS,
  SPECIAL_CONDITION_OPTIONS,
  HEALTH_STATUS_OPTIONS,
} from "@/features/albergue/constants/mascota-options";

function TagCard({ option, selected, onSelect, size = "normal" }) {
  const isSmall = size === "small";

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "relative group flex flex-col items-center justify-center gap-2.5 rounded-2xl border bg-white transition-all duration-200 focus:outline-none",
        isSmall ? "p-3.5" : "p-5",
        selected
          ? "border-[#7a8e6e] bg-[#f5f8f2] shadow-md ring-1 ring-[#8b9e7e]/20"
          : "border-[#d5d0c8] hover:border-[#8b9e7e] hover:shadow-sm"
      )}
    >
      <span className={cn("leading-none", isSmall ? "text-2xl" : "text-3xl")}>
        {option.emoji}
      </span>
      <span
        className={cn(
          "font-semibold text-gray-800 text-center",
          isSmall ? "text-xs" : "text-sm"
        )}
      >
        {option.label}
      </span>
    </button>
  );
}

function PillTag({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200",
        selected
          ? "border-[#7a8e6e] bg-[#f5f8f2] text-[#5e7a50] ring-1 ring-[#8b9e7e]/20"
          : "border-[#d5d0c8] bg-white text-gray-700 hover:border-[#8b9e7e]"
      )}
    >
      <span className="text-base">{option.emoji}</span>
      {option.label}
    </button>
  );
}

function CheckTag({ option, checked, onToggle }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(option.id)}
        className="sr-only"
      />
      <div
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
          checked
            ? "bg-[#8b9e7e] border-[#8b9e7e]"
            : "border-[#c8c2b8] bg-white group-hover:border-[#8b9e7e]"
        )}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
      <span className="text-sm text-gray-700 flex items-center gap-1.5">
        <span>{option.emoji}</span>
        {option.label}
      </span>
    </label>
  );
}

function SectionLabel({ children, required, comingSoon }) {
  return (
    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
      {comingSoon && (
        <span className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
          Próximamente
        </span>
      )}
    </h3>
  );
}

export function StepTags({ tags, onTagChange }) {
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

  const handleCheckToggle = (key) => (value) => {
    const current = tags[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onTagChange(key, updated);
  };

  const breedList = tags.animalType ? BREED_OPTIONS : [];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-9">
      {/* Tipo de animal */}
      <div className="space-y-3">
        <SectionLabel required>Tipo de animal</SectionLabel>
        <div className="grid grid-cols-2 gap-4 max-w-[16rem]">
          {ANIMAL_TYPE_OPTIONS.map((opt) => (
            <TagCard
              key={opt.id}
              option={opt}
              selected={tags.animalType === opt.id}
              onSelect={handleSingleSelect("animalType")}
            />
          ))}
        </div>
      </div>

      {/* Raza — pendiente de catálogo en backend */}
      {breedList.length > 0 && (
        <div className="space-y-3 opacity-60">
          <SectionLabel comingSoon>Raza</SectionLabel>
          <select
            disabled
            value=""
            className="w-full max-w-sm border border-[#d5d0c8] rounded-xl py-3.5 px-4 text-sm text-gray-500 bg-gray-50 cursor-not-allowed appearance-none"
          >
            <option value="">Disponible próximamente</option>
          </select>
        </div>
      )}

      {/* Edad */}
      <div className="space-y-3">
        <SectionLabel required>Edad</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AGE_OPTIONS.map((opt) => (
            <TagCard
              key={opt.id}
              option={opt}
              selected={tags.age === opt.id}
              onSelect={handleSingleSelect("age")}
            />
          ))}
        </div>
      </div>

      {/* Tamaño */}
      <div className="space-y-3">
        <SectionLabel>Tamaño</SectionLabel>
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          {SIZE_OPTIONS.map((opt) => (
            <TagCard
              key={opt.id}
              option={opt}
              selected={tags.size === opt.id}
              onSelect={handleSingleSelect("size")}
            />
          ))}
        </div>
      </div>

      {/* Color — pendiente de catálogo en backend */}
      <div className="space-y-3 opacity-60 pointer-events-none">
        <SectionLabel comingSoon>Color</SectionLabel>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_OPTIONS.map((opt) => (
            <PillTag
              key={opt.id}
              option={opt}
              selected={false}
              onSelect={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Sexo */}
      <div className="space-y-3">
        <SectionLabel required>Sexo</SectionLabel>
        <div className="grid grid-cols-2 gap-4 max-w-[16rem]">
          {SEX_OPTIONS.map((opt) => (
            <TagCard
              key={opt.id}
              option={opt}
              selected={tags.sex === opt.id}
              onSelect={handleSingleSelect("sex")}
            />
          ))}
        </div>
      </div>

      {/* Nivel de energía */}
      <div className="space-y-3">
        <SectionLabel>Nivel de energía</SectionLabel>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {ENERGY_OPTIONS.map((opt) => (
            <TagCard
              key={opt.id}
              option={opt}
              selected={tags.energy === opt.id}
              onSelect={handleSingleSelect("energy")}
            />
          ))}
        </div>
      </div>

      {/* Compatibilidad */}
      <div className="space-y-3">
        <SectionLabel>Compatibilidad</SectionLabel>
        <div className="flex flex-wrap gap-2.5">
          {COMPATIBILITY_OPTIONS.filter((o) =>
            ["kids", "dogs", "cats"].includes(o.id),
          ).map((opt) => (
            <PillTag
              key={opt.id}
              option={opt}
              selected={(tags.compatibility || []).includes(opt.id)}
              onSelect={handleMultiSelect("compatibility")}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5 opacity-60 pointer-events-none pt-1">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded-full self-center">
            Próximamente
          </span>
          {COMPATIBILITY_OPTIONS.filter((o) =>
            ["seniors", "disabled"].includes(o.id),
          ).map((opt) => (
            <PillTag
              key={opt.id}
              option={opt}
              selected={false}
              onSelect={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Condición especial */}
      <div className="space-y-3">
        <SectionLabel>Condición especial</SectionLabel>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {SPECIAL_CONDITION_OPTIONS.map((opt) => (
            <TagCard
              key={opt.id}
              option={opt}
              selected={tags.specialCondition === opt.id}
              onSelect={handleSingleSelect("specialCondition")}
              size="small"
            />
          ))}
        </div>
      </div>

      {/* Estado de salud — pendiente de catálogo en backend */}
      <div className="space-y-3 opacity-60 pointer-events-none">
        <SectionLabel comingSoon>Estado de salud</SectionLabel>
        <div className="space-y-2">
          {HEALTH_STATUS_OPTIONS.map((opt) => (
            <CheckTag
              key={opt.id}
              option={opt}
              checked={false}
              onToggle={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
