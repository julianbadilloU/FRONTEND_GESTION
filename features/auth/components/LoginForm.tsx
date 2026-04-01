"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Dog } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schemas";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthAlert } from "@/features/auth/components/AuthAlert";

type LoginFormProps = {
  onSuccess?: (email: string) => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPw, setShowPw] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocking, setIsBlocking] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  // Start lockout countdown
  const startLockout = () => {
    setIsBlocking(true);
    let secs = 60;
    setCountdown(secs);
    const timer = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) {
        clearInterval(timer);
        setIsBlocking(false);
        setAttempts(0);
        setCountdown(null);
      }
    }, 1000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (isBlocking) return;
    setServerError(null);

    try {
      // TODO: replace with real API call
      await new Promise((r) => setTimeout(r, 400));
      // Simulated failure path for demo - adjust flag 'failed'
      const failed = false; 
      if (failed) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError("email", { type: "server", message: "El correo no está registrado" });
        if (newAttempts >= 3) startLockout();
        return;
      }
      onSuccess?.(data.email);
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.");
    }
  };

  return (
    <motion.div
      key="login"
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
          Inicia Sesión
        </h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">
          Ingresa tus datos
        </p>
      </div>

      {isBlocking && countdown !== null && (
        <div className="w-full max-w-sm">
          <AuthAlert type="warn" title="Cuenta Bloqueada Temporalmente">
            Demasiados intentos. Reintentar en{" "}
            <span className="font-serif font-bold text-lg">{formatTime(countdown)}</span>
          </AuthAlert>
        </div>
      )}

      {!isBlocking && (serverError || errors.root?.message) && (
        <div className="w-full max-w-sm">
          <AuthAlert type="error">{serverError ?? errors.root?.message}</AuthAlert>
        </div>
      )}

      <form
        className={`w-full max-w-sm space-y-6 ${isBlocking ? "opacity-40 pointer-events-none grayscale" : ""}`}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <AuthInput
          label="Correo Electrónico"
          id="li-email"
          type="email"
          placeholder=""
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-3">
          <AuthInput
            label="Contraseña"
            id="li-pw"
            placeholder=""
            showToggle
            isShown={showPw}
            onToggle={() => setShowPw((v) => !v)}
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-center">
            <Link
              href="/recuperar-contrasena"
              className="text-[0.7rem] text-[#8ea482] font-medium hover:underline text-center"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <AuthButton 
             type="submit" 
             disabled={isSubmitting || isBlocking}
             className="w-auto px-16 py-3 rounded-full bg-[#a9c99a] hover:bg-[#81af6d] text-white shadow-none text-base normal-case tracking-normal font-semibold"
          >
            {isSubmitting ? "Ingresando..." : "Login"}
          </AuthButton>
        </div>
      </form>

      <p className="text-center text-[0.75rem] font-bold text-gray-900 pt-4">
        No tienes una cuenta?{" "}
        <Link href="/registro" className="text-[#81af6d] font-normal hover:underline ml-1">
          Sign Up
        </Link>
      </p>
    </motion.div>
  );
}
