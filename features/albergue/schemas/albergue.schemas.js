import { z } from "zod";

export const albergueProfileSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre demasiado largo"),
  nit: z
    .string()
    .min(5, "NIT demasiado corto")
    .max(20, "NIT demasiado largo")
    .regex(/^\d+$/, "El NIT solo debe contener números"),
  whatsapp: z
    .string()
    .min(7, "Número de WhatsApp inválido")
    .max(15, "Número de WhatsApp inválido")
    .regex(/^\d+$/, "Solo se permiten números"),
  address: z.string().max(200, "Dirección demasiado larga").optional(),
  city: z.string().min(2, "Ciudad requerida").max(100, "Ciudad demasiado larga"),
  website: z
    .string()
    .url("URL inválida. Incluye http:// o https://")
    .max(200)
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),
});
