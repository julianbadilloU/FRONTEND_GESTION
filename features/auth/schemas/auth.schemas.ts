import { z } from "zod";

// ──── Signup ────
export const signupSchema = z
  .object({
    email: z.string().email({ message: "Formato de correo inválido" }),
    password: z
      .string()
      .min(8, { message: "Mínimo 8 caracteres" })
      .regex(/[A-Z]/, { message: "Debe incluir al menos una mayúscula" })
      .regex(/[0-9]/, { message: "Debe incluir al menos un número" })
      .regex(/[^A-Za-z0-9]/, { message: "Debe incluir al menos un carácter especial" }),
    confirm: z.string(),
    role: z.enum(["albergue", "adoptante"]),
    terms: z.boolean().refine((v) => v === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

// ──── Login ────
export const loginSchema = z.object({
  email: z.string().email({ message: "Formato de correo inválido" }),
  password: z.string().min(1, { message: "Ingresa tu contraseña" }),
  remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ──── Recuperar contraseña ────
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Formato de correo inválido" }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
