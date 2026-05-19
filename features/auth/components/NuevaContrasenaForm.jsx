"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { cn } from "@/lib/utils/cn";
import { apiClient } from "@/lib/http/api-client";

// ─── Schema ───────────────────────────────────────────────────────────────────
const nuevaContrasenaSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número")
      .regex(
        /[^A-Za-z0-9]/,
        "Debe incluir al menos un carácter especial",
      ),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

// ─── Password strength bar ────────────────────────────────────────────────────
function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function StrengthBar({ password }) {
  const strength = getStrength(password);

  const labels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = [
    "",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-500",
  ];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              level <= strength ? colors[strength] : "bg-gray-200",
            )}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p
          className={cn(
            "text-[0.65rem] font-medium text-right",
            strength <= 1 && "text-red-400",
            strength === 2 && "text-orange-400",
            strength === 3 && "text-yellow-500",
            strength >= 4 && "text-green-500",
          )}
        >
          {labels[strength]}
        </p>
      )}
    </div>
  );
}

// ─── Estados del componente ───────────────────────────────────────────────────
const STATUS = {
  FORM: "form",
  SUCCESS: "success",
  ERROR: "error",
  INVALID_TOKEN: "invalid_token",
};

export function NuevaContrasenaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(STATUS.FORM);
  const [serverError, setServerError] = useState(null);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(nuevaContrasenaSchema),
    mode: "onChange",
  });

  const password = watch("password") ?? "";

  // Si no hay token, mostrar error inmediato
  useEffect(() => {
    if (!token) {
      setStatus(STATUS.INVALID_TOKEN);
    }
  }, [token]);

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await apiClient.post("/api/auth/reset-password", {
        token,
        newPassword: data.password,
      });
      setStatus(STATUS.SUCCESS);
    } catch (error) {
      if (error.response?.status === 400) {
        setServerError(
          "El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.",
        );
        setStatus(STATUS.INVALID_TOKEN);
      } else if (error.response?.status === 500) {
        setServerError("Error interno del servidor. Intenta de nuevo más tarde.");
      } else {
        setServerError("Error de conexión. Intenta de nuevo.");
      }
    }
  };

  // Pantalla: token inválido/expirado
  if (status === STATUS.INVALID_TOKEN) {
    return (
      <motion.div
        key="invalid-token"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <X size={28} className="text-red-400" />
        </div>
        <h2 className="font-bold text-xl text-gray-900">Enlace Inválido</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo
          para restablecer tu contraseña.
        </p>
        <Link
          href="/recuperar-contrasena"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#a9c99a] hover:bg-[#81af6d] text-white text-sm font-semibold transition-colors"
        >
          Solicitar nuevo enlace
        </Link>
      </motion.div>
    );
  }

  // Pantalla: éxito
  if (status === STATUS.SUCCESS) {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check size={28} className="text-green-500" />
        </div>
        <h2 className="font-bold text-xl text-gray-900">
          Contraseña Actualizada
        </h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Tu contraseña se ha restablecido exitosamente. Ahora puedes iniciar
          sesión con tu nueva contraseña.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#a9c99a] hover:bg-[#81af6d] text-white text-sm font-semibold transition-colors"
        >
          Iniciar Sesión
        </Link>
      </motion.div>
    );
  }

  // Pantalla: formulario
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-[50vh] space-y-6"
      >
        <div className="text-center space-y-4 w-full max-w-sm">
          <KeyRound
            className="mx-auto text-[#b4d2a6]"
            size={56}
            strokeWidth={1.2}
          />
          <h2 className="font-bold text-[1.4rem] text-gray-900 tracking-tight">
            Nueva Contraseña
          </h2>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Ingresa tu nueva contraseña. Asegúrate de que sea segura.
          </p>
        </div>

        {serverError && (
          <div className="w-full max-w-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-xs text-red-600 font-medium">{serverError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="w-full max-w-sm space-y-5"
        >
          <div className="space-y-2">
            <AuthInput
              label="Nueva Contraseña"
              id="np-password"
              type={showPw ? "text" : "password"}
              placeholder=""
              showToggle
              isShown={showPw}
              onToggle={() => setShowPw((v) => !v)}
              error={errors.password?.message}
              {...register("password")}
            />
            <StrengthBar password={password} />
          </div>

          <AuthInput
            label="Confirmar Contraseña"
            id="np-confirm"
            type="password"
            placeholder=""
            error={errors.confirm?.message}
            {...register("confirm")}
          />

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-auto px-12 py-3 rounded-full bg-[#a9c99a] hover:bg-[#81af6d] text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando…
                </>
              ) : (
                "Restablecer Contraseña"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
