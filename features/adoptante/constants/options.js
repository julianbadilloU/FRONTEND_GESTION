// ──── Opciones del wizard de onboarding del adoptante ────

export const ANIMAL_TYPE_OPTIONS = [
  { id: "dog",  label: "Perro",  emoji: "🐶" },
  { id: "cat",  label: "Gato",   emoji: "🐱" },
  { id: "both", label: "Ambos",  emoji: "🐾" },
];

export const SIZE_OPTIONS = [
  { id: "small",  label: "Pequeño",         emoji: "🐾", hint: "Menos de 10 kg" },
  { id: "medium", label: "Mediano",          emoji: "🐕", hint: "10 – 25 kg" },
  { id: "large",  label: "Grande",           emoji: "🦮", hint: "Más de 25 kg" },
  { id: "any",    label: "Sin Preferencia",  emoji: "✨", hint: "" },
];

export const SEX_OPTIONS = [
  { id: "male",   label: "Macho",           emoji: "♂️" },
  { id: "female", label: "Hembra",          emoji: "♀️" },
  { id: "any",    label: "Sin Preferencia", emoji: "💫" },
];

export const AGE_OPTIONS = [
  { id: "puppy",  label: "Cachorro",        emoji: "🐣", hint: "0 – 1 año"  },
  { id: "young",  label: "Joven",           emoji: "🐕", hint: "1 – 3 años" },
  { id: "adult",  label: "Adulto",          emoji: "🐩", hint: "3 – 8 años" },
  { id: "senior", label: "Senior",          emoji: "🦴", hint: "8+ años"    },
  { id: "any",    label: "Sin Preferencia", emoji: "✨", hint: ""            },
];

/** Cada opción puede ser tipo "color" o "multicolor" */
export const COLOR_OPTIONS = [
  { id: "black",      label: "Negro",          color: "#1c1c1c", type: "color" },
  { id: "white",      label: "Blanco",         color: "#f2ede3", type: "color" },
  { id: "brown",      label: "Café",           color: "#7a4040", type: "color" },
  { id: "gray",       label: "Gris",           color: "#b8b6b4", type: "color" },
  { id: "orange",     label: "Anaranjado",     color: "#e6a030", type: "color" },
  { id: "multicolor", label: "Multicolor",                       type: "multicolor" },
  { id: "any",        label: "Sin Preferencia", color: "#d4d0cc", type: "color" },
];

export const BREED_OPTIONS = [
  { id: "labrador",       label: "Labrador",         image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200&h=200", group: "dog" },
  { id: "bulldog",        label: "Bulldog",          image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=200&h=200", group: "dog" },
  { id: "golden",         label: "Golden Retriever", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200&h=200", group: "dog" },
  { id: "mestizo_dog",    label: "Mestizo",          image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200&h=200", group: "dog" },
  { id: "poodle",         label: "Poodle",           image: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80&w=200&h=200", group: "dog" },
  { id: "beagle",         label: "Beagle",           image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=200&h=200", group: "dog" },
  { id: "siames",         label: "Siamés",           image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=200&h=200", group: "cat" },
  { id: "persa",          label: "Persa",            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200&h=200", group: "cat" },
  { id: "comun",          label: "Común",            image: "https://images.unsplash.com/photo-1573865526739-10659fef78a1?auto=format&fit=crop&q=80&w=200&h=200", group: "cat" },
  { id: "otras",          label: "Otras",            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200&h=200", group: "cat" },
];

export const ENERGY_OPTIONS = [
  { id: "calm",     label: "Tranquilo",        emoji: "😴", hint: "Le gusta la calma" },
  { id: "moderate", label: "Moderado",          emoji: "🐾", hint: "Balance perfecto" },
  { id: "active",   label: "Activo",            emoji: "⚡", hint: "Mucha energía"    },
  { id: "any",      label: "Sin Preferencia",   emoji: "✨", hint: ""                 },
];

/**
 * Configuración de cada paso del wizard.
 * variant: "emoji" | "color"
 */
export const WIZARD_STEPS = [
  {
    key:      "personalData",
    question: "Ingresa tus datos personales",
    variant:  "form",
  },
  {
    key:      "animalType",
    question: "¿ Qué tipo de animal buscas ?",
    variant:  "emoji",
    options:  ANIMAL_TYPE_OPTIONS,
  },
  {
    key:      "breed",
    question: "¿ Qué raza prefieres ?",
    variant:  "image",
    options:  BREED_OPTIONS,
    allowNone: true,
  },
  {
    key:      "size",
    question: "¿ Qué tamaño prefieres ?",
    variant:  "emoji",
    options:  SIZE_OPTIONS,
  },
  {
    key:      "sex",
    question: "¿ Qué sexo prefieres ?",
    variant:  "emoji",
    options:  SEX_OPTIONS,
  },
  {
    key:      "age",
    question: "¿ Qué edad prefieres ?",
    variant:  "emoji",
    options:  AGE_OPTIONS,
  },
  {
    key:      "color",
    question: "¿ Qué color prefieres ?",
    variant:  "color",
    options:  COLOR_OPTIONS,
  },
  {
    key:      "energy",
    question: "¿ Qué nivel de energía buscas ?",
    variant:  "emoji",
    options:  ENERGY_OPTIONS,
  },
];
