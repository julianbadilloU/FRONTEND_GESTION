"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Dog } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { loginSchema } from "@/features/auth/schemas/auth.schemas";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthAlert } from "@/features/auth/components/AuthAlert";
import { apiClient } from "@/lib/http/api-client";
import { saveSessionTokens } from "@/lib/auth/token-storage";

export function LoginForm({ onSuccess }) {
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    setServerError(null);

    try {
      const response = await apiClient.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      });

      let accessToken = response.data;
      if (typeof accessToken === "object") {
        accessToken = accessToken.data?.token || accessToken.token || accessToken.accessToken || accessToken.jwt || accessToken.data;
      }
      
      saveSessionTokens({ accessToken });

      // Decodificar JWT para obtener rol, estado_cuenta y redirigir
      let role = null;
      let estadoCuenta = null;
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        role = payload.role;
        estadoCuenta = payload.estado_cuenta;
      } catch {
        role = null;
      }

      onSuccess?.({ email: data.email, role, estado_cuenta: estadoCuenta });
    } catch (error) {
      if (error.response) {
        const { status, data: errData } = error.response;
        if (status === 400) {
          setServerError("Error de validación (correo o contraseña en formato incorrecto).");
        } else if (status === 401) {
          setError("email", { type: "server", message: "Correo o contraseña incorrectos" });
          setError("password", { type: "server", message: "Correo o contraseña incorrectos" });
        } else if (status === 403) {
          setServerError(errData?.message || "Demasiados intentos. Cuenta bloqueada temporalmente. Intenta en 15 min.");
        } else if (status === 500) {
          setServerError("Error interno del servidor. Intenta de nuevo más tarde.");
        } else {
          setServerError("Ocurrió un error inesperado al iniciar sesión.");
        }
      } else {
        setServerError("Error de conexión. Intenta de nuevo.");
      }
    }
  };

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 px-4"
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

      {(serverError || errors.root?.message) && (
        <div className="w-full max-w-sm">
          <AuthAlert type="error">{serverError ?? errors.root?.message}</AuthAlert>
        </div>
      )}

      <form
        className="w-full max-w-sm space-y-6"
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
             disabled={isSubmitting}
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
