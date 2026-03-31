"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Circle, Dog, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { signupSchema, type SignupFormValues } from "@/features/auth/schemas/auth.schemas";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthAlert } from "@/features/auth/components/AuthAlert";
import { cn } from "@/lib/utils/cn";

type SignupFormProps = {
  /** Called with validated form values when registration succeeds (mock or real). */
  onSuccess?: (email: string) => void;
};

const PASSWORD_CHECKS = [
  { label: "8+ Caracteres", test: (v: string) => v.length >= 8 },
  { label: "Una Mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Un Número", test: (v: string) => /[0-9]/.test(v) },
  { label: "Especial (#@!)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: { role: "albergue", terms: false },
  });

  const password = watch("password") ?? "";
  const confirm = watch("confirm") ?? "";
  const role = watch("role");
  const email = watch("email") ?? "";

  const score = PASSWORD_CHECKS.filter((c) => c.test(password)).length;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);
    try {
      // TODO: replace with real API call via apiClient
      await new Promise((r) => setTimeout(r, 400));
      onSuccess?.(data.email);
    } catch {
      setServerError("Ocurrió un error al registrarse. Intenta de nuevo.");
    }
  };

  return (
    <motion.div
      key="signup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Mobile only: Logo + Title */}
      <div className="md:hidden flex flex-col items-center w-full mb-4">
        <header className="flex items-center gap-2 self-start mb-8 text-gray-900">
           <Dog size={20} className="text-gray-900" />
          <span className="font-bold text-lg tracking-tight">
            FurMatch
          </span>
        </header>

        <h1 className="text-[2.5rem] leading-[1.1] font-bold text-gray-900 text-center">
          Encuentra
          <br />
          tu {" "}
          <span className="font-serif italic font-normal text-[#81af6d]">
            match
          </span>
        </h1>
      </div>

      <div className="text-center space-y-4 w-full">
        <PawPrint 
          className="mx-auto text-[#b4d2a6] rotate-[-5deg]" 
          size={56} 
          fill="currentColor" 
        />
        <h2 className="font-bold text-[1.4rem] text-gray-900 tracking-tight">
          Crea tu cuenta
        </h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Une fuerzas por el bienestar animal
        </p>
      </div>

      {/* Role selector */}
      <div className="flex gap-4">
        {(
          [
            { id: "albergue", label: "Albergue", icon: "🏠" },
            { id: "adoptante", label: "Adoptante", icon: "🧑‍🤝‍🐕" },
          ] as const
        ).map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setValue("role", r.id, { shouldValidate: true })}
            className={cn(
              "flex-1 p-5 rounded-2xl border-2 transition-all duration-300 text-center space-y-3 group",
              role === r.id
                ? "bg-white border-sage-500 shadow-xl shadow-sage-200/50 scale-105"
                : "bg-sage-50/50 border-sage-200 hover:border-sage-400 hover:bg-white",
            )}
          >
            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
              {r.icon}
            </div>
            <span className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              {r.label}
            </span>
          </button>
        ))}
      </div>

      {serverError && (
        <div className="w-full max-w-sm mx-auto">
          <AuthAlert type="error">{serverError}</AuthAlert>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput
          label="Correo Electrónico"
          id="su-email"
          type="email"
          placeholder="hola@ejemplo.com"
          error={errors.email?.message}
          success={email && EMAIL_RE.test(email) && !errors.email ? "✓ Correo válido" : null}
          {...register("email")}
        />

        <div className="space-y-4">
          <AuthInput
            label="Contraseña"
            id="su-pw"
            placeholder="••••••••"
            showToggle
            isShown={showPw}
            onToggle={() => setShowPw((v) => !v)}
            {...register("password")}
          />

          {/* Strength bars */}
          <div className="flex gap-1 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  i <= score
                    ? (["bg-red-400", "bg-amber-400", "bg-sage-300", "bg-sage-500"] as const)[
                        score - 1
                      ]
                    : "bg-gray-200",
                )}
              />
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.72rem] font-medium">
            {PASSWORD_CHECKS.map((req) => {
              const ok = req.test(password);
              return (
                <div
                  key={req.label}
                  className={cn("flex items-center gap-1.5 min-w-[90px]", ok ? "text-sage-600" : "text-gray-400")}
                >
                  {ok ? <Check size={12} strokeWidth={4} /> : <Circle size={10} />}
                  {req.label}
                </div>
              );
            })}
          </div>
        </div>

        <AuthInput
          label="Confirmar Contraseña"
          id="su-pw2"
          placeholder="••••••••"
          showToggle
          isShown={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          error={errors.confirm?.message}
          success={
            confirm && password === confirm && !errors.confirm ? "✓ Coinciden" : null
          }
          {...register("confirm")}
        />

        <div className="flex justify-center">
          <label className="inline-flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="su-terms"
              className="w-5 h-5 rounded-md border-2 border-sage-300 text-sage-500 focus:ring-sage-200 transition-all cursor-pointer shrink-0"
              {...register("terms")}
            />
            <span className="text-xs text-gray-500 font-medium transition-colors group-hover:text-gray-700">
              Acepto los{" "}
              <Link href="/terminos-y-condiciones" className="text-sage-600 font-bold hover:underline">
                Términos
              </Link>{" "}
              y la{" "}
              <Link href="/terminos-y-condiciones" className="text-sage-600 font-bold hover:underline">
                Política de Privacidad
              </Link>
            </span>
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-[0.78rem] text-center">{errors.terms.message as string}</p>
        )}

        <div className="flex justify-center pt-2">
          <AuthButton
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-auto px-12 py-3 rounded-full bg-[#a9c99a] hover:bg-[#81af6d] text-white shadow-none text-base normal-case tracking-normal font-semibold flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? "Registrando..." : "Registrarme"}
            {!isSubmitting && (
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            )}
          </AuthButton>
        </div>
      </form>

      <p className="text-center text-sm font-medium text-gray-400">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-sage-600 font-bold hover:underline">
          Inicia Sesión
        </Link>
      </p>
    </motion.div>
  );
}
