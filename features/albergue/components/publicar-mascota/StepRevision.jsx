"use client";

import {
  ANIMAL_TYPE_OPTIONS,
  AGE_OPTIONS,
  SIZE_OPTIONS,
  SEX_OPTIONS,
  ENERGY_OPTIONS,
  COMPATIBILITY_OPTIONS,
  SPECIAL_CONDITION_OPTIONS,
} from "@/features/albergue/constants/mascota-options";

function getLabel(options, id) {
  if (!id || !options) return null;
  return options.find((o) => o.id === id)?.label || null;
}

function TagPill({ label }) {
  return (
    <span className="inline-block bg-[#8b9e7e]/20 text-[#5e7a50] text-xs font-semibold px-3 py-1.5 rounded-full">
      {label}
    </span>
  );
}

export function StepRevision({ formData, tags, photos }) {
  const allTags = [];

  const animalLabel = getLabel(ANIMAL_TYPE_OPTIONS, tags.animalType);
  if (animalLabel) allTags.push(animalLabel);

  const ageLabel = getLabel(AGE_OPTIONS, tags.age);
  if (ageLabel) allTags.push(ageLabel);

  const sizeLabel = getLabel(SIZE_OPTIONS, tags.size);
  if (sizeLabel) allTags.push(sizeLabel);

  const sexLabel = getLabel(SEX_OPTIONS, tags.sex);
  if (sexLabel) allTags.push(sexLabel);

  const energyLabel = getLabel(ENERGY_OPTIONS, tags.energy);
  if (energyLabel) allTags.push(energyLabel);

  const conditionLabel = getLabel(
    SPECIAL_CONDITION_OPTIONS,
    tags.specialCondition
  );
  if (conditionLabel) allTags.push(conditionLabel);

  (tags.compatibility || [])
    .filter((id) => ["kids", "dogs", "cats"].includes(id))
    .forEach((id) => {
      const label = getLabel(COMPATIBILITY_OPTIONS, id);
      if (label) allTags.push(label);
    });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#f0ede8] rounded-2xl p-7 sm:p-10 space-y-7">
        {/* Nombre */}
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#a09890] mb-1.5">
            Nombre
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {formData.nombre || "—"}
          </p>
        </div>

        {/* Descripción */}
        {formData.descripcion && (
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#a09890] mb-1.5">
              Descripción
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{formData.descripcion}</p>
          </div>
        )}

        {/* Fotos */}
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#a09890] mb-3">
            Fotos ({photos.length})
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-[#d5d0c8] shadow-sm"
              >
                <img
                  src={photo.preview}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Estado */}
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#a09890] mb-2">
            Estado
          </p>
          <span className="inline-flex items-center gap-2 bg-[#8b9e7e]/15 text-[#5e7a50] text-sm font-semibold px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-[#5e7a50] rounded-full" />
            Disponible
          </span>
        </div>

        {/* Etiquetas */}
        {allTags.length > 0 && (
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#a09890] mb-3">
              Etiquetas
            </p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((label) => (
                <TagPill key={label} label={label} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
