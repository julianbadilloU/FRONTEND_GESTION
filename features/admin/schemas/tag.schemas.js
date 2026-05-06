import { z } from "zod";

export const tagSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  tipo: z.enum(["categorico", "numerico", "booleano"]),
  peso: z.number().min(0).max(1).default(0.5),
  filtro_absoluto: z.boolean().default(false),
  activo: z.boolean().default(true),
});

export const tagOptionSchema = z.object({
  nombre: z.string().min(1, "El nombre de la opción es obligatorio"),
});
