"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PawPrint, Dog } from "lucide-react";

import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthAlert } from "@/features/auth/components/AuthAlert";
import { cn } from "@/lib/utils/cn";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PASSWORD_CHECKS = [
    { label: "8+ Caracteres", test: (v: string) => v.length >= 8 },
    { label: "Una Mayúscula", test: (v: string) => /[A-Z]/.test(v) },
    { label: "Un Número", test: (v: string) => /[0-9]/.test(v) },
    { label: "Especial (#@!)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
  ];

  const score = PASSWORD_CHECKS.filter((c) => c.test(password)).length;

  const passwordsMatch = password === confirm && password.length > 0;
  const isValid = score === 4 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Completa todos los requisitos de la contraseña");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: replace with real API call via apiClient
      // const res = await apiClient.post("/auth/reset-password", { password });
      await new Promise((r) => setTimeout(r, 400));

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      key="reset"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[50vh] space-y-6"
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

      <div className="text-center space-y-4 w-full max-w-sm">
        <PawPrint
          className="mx-auto text-[#b4d2a6] rotate-[-5deg]"
          size={56}
          fill="currentColor"
        />
        <h2 className="font-bold text-[1.4rem] text-gray-900 tracking-tight">
          Nueva contraseña
        </h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Ingresa tu nueva contraseña
        </p>
      </div>

      {error && (
        <div className="w-full max-w-sm">
          <AuthAlert type="error">{error}</AuthAlert>
        </div>
      )}

      {success && (
        <div className="w-full max-w-sm">
          <AuthAlert type="ok">
            Contraseña actualizada correctamente. Redirigiendo al login...
          </AuthAlert>
        </div>
      )}

      {!success && (
        <form
          className={`w-full max-w-sm space-y-6 ${isSubmitting ? "opacity-40 pointer-events-none grayscale" : ""}`}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="space-y-4">
            <AuthInput
              label="Nueva contraseña"
              id="reset-pw"
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      {ok ? (
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      )}
                    </svg>
                    {req.label}
                  </div>
                );
              })}
            </div>
          </div>

          <AuthInput
            label="Confirmar contraseña"
            id="reset-pw-confirm"
            type="password"
            placeholder=""
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirm && !passwordsMatch ? "Las contraseñas no coinciden" : null}
            success={passwordsMatch ? "✓ Coinciden" : null}
          />

          <div className="flex justify-center pt-2">
            <AuthButton
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-auto px-16 py-3 rounded-full bg-[#a9c99a] hover:bg-[#81af6d] text-white shadow-none text-base normal-case tracking-normal font-semibold"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </AuthButton>
          </div>
        </form>
      )}
    </motion.div>
  );
}
