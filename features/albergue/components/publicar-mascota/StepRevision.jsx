"use client";

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

function getLabel(options, id) {
  if (Array.isArray(options)) {
    return options.find((o) => o.id === id)?.label || null;
  }
  // For breed options (object with dog/cat keys)
  for (const group of Object.values(options)) {
    const found = group.find((o) => o.id === id);
    if (found) return found.label;
  }
  return null;
}

function TagPill({ label }) {
  return (
    <span className="inline-block bg-[#a9c99a]/30 text-[#4a7540] text-xs font-semibold px-3 py-1 rounded-full">
      {label}
    </span>
  );
}

export function StepRevision({ formData, tags, photos }) {
  const allTags = [];

  const animalLabel = getLabel(ANIMAL_TYPE_OPTIONS, tags.animalType);
  if (animalLabel) allTags.push(animalLabel);

  const breedLabel = getLabel(BREED_OPTIONS, tags.breed);
  if (breedLabel) allTags.push(breedLabel);

  const ageLabel = getLabel(AGE_OPTIONS, tags.age);
  if (ageLabel) allTags.push(ageLabel);

  const sizeLabel = getLabel(SIZE_OPTIONS, tags.size);
  if (sizeLabel) allTags.push(sizeLabel);

  const colorLabel = getLabel(COLOR_OPTIONS, tags.color);
  if (colorLabel) allTags.push(colorLabel);

  const sexLabel = getLabel(SEX_OPTIONS, tags.sex);
  if (sexLabel) allTags.push(sexLabel);

  const energyLabel = getLabel(ENERGY_OPTIONS, tags.energy);
  if (energyLabel) allTags.push(energyLabel);

  const conditionLabel = getLabel(
    SPECIAL_CONDITION_OPTIONS,
    tags.specialCondition
  );
  if (conditionLabel) allTags.push(conditionLabel);

  (tags.compatibility || []).forEach((id) => {
    const label = getLabel(COMPATIBILITY_OPTIONS, id);
    if (label) allTags.push(label);
  });

  (tags.healthStatus || []).forEach((id) => {
    const label = getLabel(HEALTH_STATUS_OPTIONS, id);
    if (label) allTags.push(label);
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#f5f2ed] rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Nombre */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Nombre
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {formData.nombre || "—"}
          </p>
        </div>

        {/* Descripción */}
        {formData.descripcion && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Descripción
            </p>
            <p className="text-sm text-gray-700">{formData.descripcion}</p>
          </div>
        )}

        {/* Fotos */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Fotos ({photos.length})
          </p>
          <div className="flex gap-2 flex-wrap">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="w-16 h-16 rounded-lg overflow-hidden border border-[#e4d5c4]"
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
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Estado
          </p>
          <span className="inline-flex items-center gap-1.5 bg-[#a9c99a]/20 text-[#4a7540] text-sm font-semibold px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-[#5e924e] rounded-full" />
            Disponible
          </span>
        </div>

        {/* Etiquetas */}
        {allTags.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
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
