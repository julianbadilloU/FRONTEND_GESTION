// ──── Opciones del wizard de publicación de mascota ────

export const ANIMAL_TYPE_OPTIONS = [
  { id: "dog", label: "Perro", emoji: "🐶" },
  { id: "cat", label: "Gato", emoji: "🐱" },
];

export const BREED_OPTIONS = {
  dog: [
    { id: "labrador", label: "Labrador" },
    { id: "bulldog", label: "Bulldog" },
    { id: "golden", label: "Golden Retriever" },
    { id: "poodle", label: "Poodle" },
    { id: "beagle", label: "Beagle" },
    { id: "mestizo_dog", label: "Mestizo" },
    { id: "otro_dog", label: "Otro" },
  ],
  cat: [
    { id: "siames", label: "Siamés" },
    { id: "persa", label: "Persa" },
    { id: "comun", label: "Común europeo" },
    { id: "mestizo_cat", label: "Mestizo" },
    { id: "otro_cat", label: "Otro" },
  ],
};

export const AGE_OPTIONS = [
  { id: "puppy", label: "Cachorro", emoji: "🐣" },
  { id: "young", label: "Joven", emoji: "⭐" },
  { id: "adult", label: "Adulto", emoji: "🐾" },
  { id: "senior", label: "Senior", emoji: "🔵" },
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
  { id: "treatment", label: "En tratamiento", emoji: "💊" },
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
