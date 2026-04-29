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
    .min(10, "El número debe tener al menos 10 dígitos")
    .max(13, "Número inválido")
    .regex(
      /^(\+57)?[0-9]{10}$/,
      "Formato colombiano: 10 dígitos (opcional +57)",
    ),
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
