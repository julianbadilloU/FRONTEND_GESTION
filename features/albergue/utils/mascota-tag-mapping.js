// Mapeo entre los slugs del wizard (front) y los pares (categoria, valor) del catálogo del backend.
// El backend devuelve tags con id_opcion (UUID), categoria (string) y valor (string). Resolvemos el
// id_opcion en runtime buscando por (categoria, valor) — así si el backend cambia los UUIDs no se
// rompe nada.

export const TAG_SLUG_TO_BACKEND = {
  animalType: {
    categoria: "Tipo de animal",
    valores: { dog: "Perro", cat: "Gato" },
  },
  age: {
    categoria: "Rango de edad",
    valores: {
      puppy: "Cachorro (0-1)",
      young: "Joven (1-3)",
      adult: "Adulto (3-7)",
      senior: "Senior (7+)",
    },
  },
  sex: {
    categoria: "Sexo",
    valores: { male: "Macho", female: "Hembra" },
  },
  size: {
    categoria: "Tamaño",
    valores: { small: "Pequeño", medium: "Mediano", large: "Grande" },
  },
  energy: {
    categoria: "Nivel de energía",
    valores: { calm: "Bajo", moderate: "Medio", active: "Alto" },
  },
  specialCondition: {
    categoria: "Condición Especial",
    valores: {
      none: "Ninguna",
      disability: "Discapacidad motriz",
      treatment: "Tratamiento crónico",
    },
  },
};

export const COMPATIBILITY_TO_BACKEND = {
  kids: { categoria: "Convivencia con niños", valor: "Recomendado" },
  dogs: { categoria: "Relación con perros", valor: "Sociable" },
  cats: { categoria: "Relación con gatos", valor: "Sociable" },
};

export const COMING_SOON_KEYS = new Set([
  "breed",
  "color",
  "healthStatus",
  "compatSeniors",
  "compatDisabled",
]);

export function buildTagsIds(tags, etiquetas) {
  const findId = (categoria, valor) => {
    const match = etiquetas.find(
      (t) => t.categoria === categoria && t.valor === valor,
    );
    return match?.id_opcion ?? null;
  };

  const ids = new Set();

  for (const [key, mapping] of Object.entries(TAG_SLUG_TO_BACKEND)) {
    const slug = tags[key];
    if (!slug) continue;
    const valor = mapping.valores[slug];
    if (!valor) continue;
    const id = findId(mapping.categoria, valor);
    if (id) ids.add(id);
  }

  for (const slug of tags.compatibility || []) {
    const mapping = COMPATIBILITY_TO_BACKEND[slug];
    if (!mapping) continue;
    const id = findId(mapping.categoria, mapping.valor);
    if (id) ids.add(id);
  }

  return Array.from(ids);
}
