import { z } from "zod";

/**
 * Schema Zod para el perfil del adoptante (HU-US-02).
 * - nombre_completo: obligatorio, 3-150 caracteres
 * - whatsapp: formato colombiano (10 dígitos, opcional +57)
 * - ciudad: obligatorio, 2-100 caracteres
 * - direccion: opcional
 * - tags: array de strings (etiquetas de preferencia)
 */
export const adoptanteProfileSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre es demasiado largo"),
  whatsapp: z
    .string()
    .min(7, "El número debe tener al menos 7 dígitos")
    .max(15, "Número inválido")
    .regex(
      /^(\+?57)?[\s-]?[0-9]{10}$/,
      "Formato inválido. Ej: 3001234567 o +573001234567",
    ),
  departamento: z
    .string()
    .min(2, "Selecciona un departamento")
    .max(100, "Departamento demasiado largo"),
  ciudad: z
    .string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(100, "Ciudad demasiado larga"),
  direccion: z
    .string()
    .max(200, "Dirección demasiado larga")
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string()).default([]),
});
