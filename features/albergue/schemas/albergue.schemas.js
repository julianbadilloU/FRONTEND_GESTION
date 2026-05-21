import { z } from "zod";

export const albergueProfileSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre demasiado largo"),
  nit: z.string().optional(),           // disabled — solo lectura, no se valida
  whatsapp: z
    .string()
    .min(7, "Número de WhatsApp inválido")
    .max(20, "Número de WhatsApp inválido")
    .regex(/^[\d+\s()-]+$/, "Número inválido"),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  website: z
    .string()
    .url("URL inválida. Incluye http:// o https://")
    .max(200)
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});
