"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Dog } from "lucide-react";
import { motion } from "framer-motion";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth.schemas";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthAlert } from "@/features/auth/components/AuthAlert";

type ForgotPasswordFormProps = {
  onSuccess?: () => void;
};

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (_data: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      // TODO: replace with real API call via apiClient
      await new Promise((r) => setTimeout(r, 400));
      setSent(true);
      onSuccess?.();
    } catch {
      setServerError("Error al enviar el correo. Intenta de nuevo.");
    }
  };

  return (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
    >
      {/* Mobile only: Logo + Title */}
      <div className="md:hidden flex flex-col items-center w-full mb-6">
        <header className="flex items-center gap-2 self-start mb-10 text-gray-900">
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

      <div className="text-center space-y-6 w-full max-w-sm">
        <PawPrint 
          className="mx-auto text-[#b4d2a6] rotate-[-5deg]" 
          size={56} 
          fill="currentColor" 
        />
        
        <h2 className="font-bold text-[1.4rem] text-gray-900 tracking-tight">
          Recupera tu contraseña
        </h2>
        
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Ingresa tu correo electrónico
        </p>
      </div>

      {sent && (
        <AuthAlert type="ok">
          Enlace de recuperación enviado. Revisa tu bandeja de entrada.
        </AuthAlert>
      )}

      {serverError && <AuthAlert type="error">{serverError}</AuthAlert>}

      <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput
          label="Correo Electrónico"
          id="forgot-email"
          type="email"
          placeholder=""
          error={errors.email?.message}
          {...register("email")}
        />
        
        <div className="flex justify-center pt-2">
          <AuthButton 
            type="submit" 
            disabled={isSubmitting || sent}
            className="w-auto px-12 py-3 rounded-full bg-[#a9c99a] hover:bg-[#81af6d] text-white shadow-none text-base normal-case tracking-normal"
          >
            {isSubmitting ? "Enviando..." : sent ? "Enviado ✓" : "Enviar"}
          </AuthButton>
        </div>
        
        <p className="text-center text-[0.7rem] text-[#8ea482] font-medium leading-relaxed px-4 pt-4">
          Si este correo está registrado, recibirás<br/>un enlace en los próximos minutos
        </p>
      </form>
    </motion.div>
  );
}
