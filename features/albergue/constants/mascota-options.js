// ──── Opciones del wizard de publicación de mascota (RF-MA-01) ────
// NOTA: Los ids deben coincidir con los VALORES del backend (string en español)
// para que sean compatibles con las opciones dinámicas de la BD.

export const ANIMAL_TYPE_OPTIONS = [
  { id: "Perro", label: "Perro", emoji: "🐶" },
  { id: "Gato", label: "Gato", emoji: "🐱" },
];

// Raza: lista única según RF-MA-01
export const BREED_OPTIONS = [
  { id: "Sin preferencia", label: "Sin preferencia" },
  { id: "Labrador", label: "Labrador" },
  { id: "Bulldog", label: "Bulldog" },
  { id: "Golden Retriever", label: "Golden Retriever" },
  { id: "Mestizo", label: "Mestizo" },
  { id: "Poodle", label: "Poodle" },
  { id: "Beagle", label: "Beagle" },
  { id: "Siamés", label: "Siamés" },
  { id: "Persa", label: "Persa" },
  { id: "Común", label: "Común" },
  { id: "Otra", label: "Otra" },
];

export const AGE_OPTIONS = [
  { id: "Cachorro (0–1 año)", label: "Cachorro (0–1 año)", emoji: "🐣" },
  { id: "Joven (1–3 años)", label: "Joven (1–3 años)", emoji: "⭐" },
  { id: "Adulto (3–7 años)", label: "Adulto (3–7 años)", emoji: "🐾" },
  { id: "Senior (+7 años)", label: "Senior (+7 años)", emoji: "🔵" },
];

export const SIZE_OPTIONS = [
  { id: "Pequeño", label: "Pequeño", emoji: "🐾" },
  { id: "Mediano", label: "Mediano", emoji: "🐕" },
  { id: "Grande", label: "Grande", emoji: "🦮" },
];

export const COLOR_OPTIONS = [
  { id: "Negro", label: "Negro", emoji: "⚫" },
  { id: "Blanco", label: "Blanco", emoji: "🤍" },
  { id: "Café", label: "Café", emoji: "🟤" },
  { id: "Gris", label: "Gris", emoji: "🩶" },
  { id: "Anaranjado", label: "Anaranjado", emoji: "🟠" },
  { id: "Multicolor", label: "Multicolor", emoji: "🌈" },
];

export const SEX_OPTIONS = [
  { id: "Macho", label: "Macho", emoji: "♂️" },
  { id: "Hembra", label: "Hembra", emoji: "♀️" },
];

export const ENERGY_OPTIONS = [
  { id: "Tranquilo", label: "Tranquilo", emoji: "😴" },
  { id: "Moderado", label: "Moderado", emoji: "🏃" },
  { id: "Muy activo", label: "Muy activo", emoji: "⚡" },
];

// Compatibilidad unificada según RF-MA-01: una sola categoría "Compatibilidad" con 5 opciones
export const COMPATIBILITY_OPTIONS = [
  { id: "Niños", label: "Niños", emoji: "👶" },
  { id: "Otros perros", label: "Otros perros", emoji: "🐶" },
  { id: "Gatos", label: "Gatos", emoji: "🐱" },
  { id: "Adultos mayores", label: "Adultos mayores", emoji: "🧓" },
  { id: "Personas con discapacidad", label: "Personas con discapacidad", emoji: "🧑‍🦽" },
];

export const SPECIAL_CONDITION_OPTIONS = [
  { id: "Sin condición", label: "Sin condición", emoji: "✅" },
  { id: "Con discapacidad", label: "Con discapacidad", emoji: "♿" },
  { id: "En tratamiento médico", label: "En tratamiento médico", emoji: "💊" },
];

export const HEALTH_STATUS_OPTIONS = [
  { id: "Vacunado", label: "Vacunado", emoji: "💉" },
  { id: "Desparasitado", label: "Desparasitado", emoji: "🔬" },
  { id: "Esterilizado", label: "Esterilizado", emoji: "🏥" },
];

export const WIZARD_STEPS = [
  { key: "datos", label: "Datos Básicos" },
  { key: "fotos", label: "Fotos" },
  { key: "tags", label: "Tags" },
  { key: "revision", label: "Revisión" },
];
