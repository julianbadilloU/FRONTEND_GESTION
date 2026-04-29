// ──── Opciones del wizard de publicación de mascota (RF-MA-01) ────

export const ANIMAL_TYPE_OPTIONS = [
  { id: "dog", label: "Perro", emoji: "🐶" },
  { id: "cat", label: "Gato", emoji: "🐱" },
];

// Raza: lista única según RF-MA-01
export const BREED_OPTIONS = [
  { id: "sin_preferencia", label: "Sin preferencia" },
  { id: "labrador", label: "Labrador" },
  { id: "bulldog", label: "Bulldog" },
  { id: "golden", label: "Golden Retriever" },
  { id: "mestizo", label: "Mestizo" },
  { id: "poodle", label: "Poodle" },
  { id: "beagle", label: "Beagle" },
  { id: "siames", label: "Siamés" },
  { id: "persa", label: "Persa" },
  { id: "comun", label: "Común" },
  { id: "otra", label: "Otra" },
];

export const AGE_OPTIONS = [
  { id: "puppy", label: "Cachorro (0-1 año)", emoji: "🐣" },
  { id: "young", label: "Joven (1-3 años)", emoji: "⭐" },
  { id: "adult", label: "Adulto (3-7 años)", emoji: "🐾" },
  { id: "senior", label: "Senior (+7 años)", emoji: "🔵" },
];

export const SIZE_OPTIONS = [
  { id: "small", label: "Pequeño", emoji: "🐾" },
  { id: "medium", label: "Mediano", emoji: "🐕" },
  { id: "large", label: "Grande", emoji: "🦮" },
];

export const COLOR_OPTIONS = [
  { id: "black", label: "Negro", emoji: "⚫" },
  { id: "white", label: "Blanco", emoji: "🤍" },
  { id: "brown", label: "Café", emoji: "🟤" },
  { id: "gray", label: "Gris", emoji: "🩶" },
  { id: "orange", label: "Anaranjado", emoji: "🟠" },
  { id: "multicolor", label: "Multicolor", emoji: "🌈" },
];

export const SEX_OPTIONS = [
  { id: "male", label: "Macho", emoji: "♂️" },
  { id: "female", label: "Hembra", emoji: "♀️" },
];

export const ENERGY_OPTIONS = [
  { id: "calm", label: "Tranquilo", emoji: "😴" },
  { id: "moderate", label: "Moderado", emoji: "🏃" },
  { id: "active", label: "Muy activo", emoji: "⚡" },
];

export const COMPATIBILITY_OPTIONS = [
  { id: "kids", label: "Niños", emoji: "👶" },
  { id: "dogs", label: "Otros perros", emoji: "🐶" },
  { id: "cats", label: "Gatos", emoji: "🐱" },
  { id: "seniors", label: "Adultos mayores", emoji: "🧓" },
  { id: "disabled", label: "Personas con discapacidad", emoji: "🧑‍🦽" },
];

export const SPECIAL_CONDITION_OPTIONS = [
  { id: "none", label: "Sin condición", emoji: "✅" },
  { id: "disability", label: "Con discapacidad", emoji: "♿" },
  { id: "treatment", label: "En tratamiento médico", emoji: "💊" },
];

export const HEALTH_STATUS_OPTIONS = [
  { id: "vaccinated", label: "Vacunado", emoji: "💉" },
  { id: "dewormed", label: "Desparasitado", emoji: "💊" },
  { id: "sterilized", label: "Esterilizado", emoji: "🏥" },
];

export const WIZARD_STEPS = [
  { key: "datos", label: "Datos Básicos" },
  { key: "fotos", label: "Fotos" },
  { key: "tags", label: "Tags" },
  { key: "revision", label: "Revisión" },
];
