// Mapeo entre los slugs del wizard (front) y las categorías del catálogo del backend.
// El backend devuelve tags con id_opcion, categoria (string) y valor (string).
// Catálogo unificado RF-US-01 + RF-MA-01: tags compartidos entre adoptante y mascota.

// Categorías que usa el wizard de publicación de mascota (RF-MA-01)
export const TAG_CATEGORIAS = {
  animalType: ["Tipo de animal"],
  breed: ["Raza"],
  age: ["Edad", "Rango de edad"],         // Rango de edad como fallback histórico
  size: ["Tamaño"],
  color: ["Color"],
  sex: ["Sexo"],
  energy: ["Nivel de energía", "Nivel de Energía"], // Nivel de Energía como fallback histórico
  compatibility: ["Compatibilidad"],
  specialCondition: ["Condición especial"],
  healthStatus: ["Estado de salud"],
};

// Mapeo de compatibilidad: label del frontend → categoría+valor del backend unificado
const COMPATIBILITY_MAP = {
  "Niños": { categoria: "Compatibilidad", valor: "Niños" },
  "Otros perros": { categoria: "Compatibilidad", valor: "Otros perros" },
  "Gatos": { categoria: "Compatibilidad", valor: "Gatos" },
  "Adultos mayores": { categoria: "Compatibilidad", valor: "Adultos mayores" },
  "Personas con discapacidad": { categoria: "Compatibilidad", valor: "Personas con discapacidad" },
};

/**
 * Obtiene las opciones disponibles para una categoría desde las etiquetas del backend.
 * @param {Array} etiquetas - Lista de etiquetas del backend [{id_opcion, valor, categoria}]
 * @param {Array} categorias - Nombres de categorías a buscar
 * @returns {Array} [{id, label}, ...] donde id es el valor string
 */
export function getOpcionesByCategoria(etiquetas, categorias) {
  if (!etiquetas || etiquetas.length === 0) return [];
  for (const cat of categorias) {
    const ops = etiquetas
      .filter((e) => e.categoria === cat)
      .map((e) => ({ id: e.valor, label: e.valor })); // id = valor string
    if (ops.length > 0) return ops;
  }
  return [];
}

/**
 * Construye el array de id_opcion a partir de los tags seleccionados en el wizard.
 * Ahora busca directamente por valor (string) en lugar de por slug.
 * @param {Object} tags - Estado de tags del wizard
 * @param {Array} etiquetas - Lista de etiquetas del backend
 * @returns {Array} ids de opciones seleccionadas
 */
export function buildTagsIds(tags, etiquetas) {
  const findId = (categorias, valor) => {
    for (const cat of categorias) {
      const match = etiquetas.find((t) => t.categoria === cat && t.valor === valor);
      if (match) return match.id_opcion;
    }
    return null;
  };

  const ids = new Set();

  // Tags de selección simple
  for (const [key, categorias] of Object.entries(TAG_CATEGORIAS)) {
    if (key === 'compatibility' || key === 'healthStatus') continue; // Se manejan aparte
    const valor = tags[key];
    if (!valor) continue;
    const id = findId(categorias, valor);
    if (id) ids.add(id);
  }

  // Compatibilidad (multi-select)
  for (const label of tags.compatibility || []) {
    const mapping = COMPATIBILITY_MAP[label];
    if (mapping) {
      const id = findId([mapping.categoria], mapping.valor);
      if (id) ids.add(id);
    } else {
      // Fallback: buscar directamente
      const id = findId(TAG_CATEGORIAS.compatibility, label);
      if (id) ids.add(id);
    }
  }

  // Estado de salud (multi-select)
  for (const valor of tags.healthStatus || []) {
    const id = findId(TAG_CATEGORIAS.healthStatus, valor);
    if (id) ids.add(id);
  }

  return Array.from(ids);
}

/**
 * Convierte tags del backend (array de {id_opcion, valor, categoria}) a estado del wizard.
 * @param {Array} tagsBackend - Tags de la mascota desde el backend
 * @param {Array} etiquetas - Catálogo completo del backend
 * @returns {Object} Estado de tags para el wizard
 */
export function mapBackendTagsToSlugs(tagsBackend, etiquetas) {
  const result = {
    animalType: "",
    breed: "",
    age: "",
    size: "",
    color: "",
    sex: "",
    energy: "",
    specialCondition: "",
    compatibility: [],
    healthStatus: [],
  };

  if (!tagsBackend || !etiquetas) return result;

  for (const tag of tagsBackend) {
    const etiqueta = etiquetas.find((e) => e.id_opcion === tag.id_opcion);
    if (!etiqueta) continue;

    const { categoria, valor } = etiqueta;

    // Buscar a qué campo pertenece esta categoría
    for (const [field, categorias] of Object.entries(TAG_CATEGORIAS)) {
      if (categorias.includes(categoria)) {
        if (field === 'compatibility') {
          // Mapear de vuelta al label del frontend
          const label = Object.entries(COMPATIBILITY_MAP).find(
            ([, m]) => m.categoria === categoria && m.valor === valor
          )?.[0];
          const valueToAdd = label || valor;
          if (!result.compatibility.includes(valueToAdd)) {
            result.compatibility.push(valueToAdd);
          }
        } else if (field === 'healthStatus') {
          if (!result.healthStatus.includes(valor)) {
            result.healthStatus.push(valor);
          }
        } else {
          result[field] = valor;
        }
        break;
      }
    }
  }

  return result;
}
