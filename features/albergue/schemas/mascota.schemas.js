import { z } from "zod";

export const mascotaDatosBasicosSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "Nombre demasiado largo"),
  descripcion: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export const mascotaTagsSchema = z.object({
  animalType: z.string().min(1, "Selecciona el tipo de animal"),
  breed: z.string().optional().or(z.literal("")),
  age: z.string().min(1, "Selecciona la edad"),
  size: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  sex: z.string().min(1, "Selecciona el sexo"),
  energy: z.string().optional().or(z.literal("")),
  compatibility: z.array(z.string()).optional().default([]),
  specialCondition: z.string().optional().or(z.literal("")),
  healthStatus: z.array(z.string()).optional().default([]),
});
