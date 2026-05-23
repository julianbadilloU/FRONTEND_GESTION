"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/http/api-client";
import { saveSessionTokens } from "@/lib/auth/token-storage";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No se encontró un token de verificación en el enlace.");
      return;
    }

    apiClient.post("/api/auth/verify-email", { token })
      .then((res) => {
        setStatus("success");
        setMessage("¡Cuenta verificada exitosamente! Redirigiendo...");
        const jwt = res.data?.data?.token;
        if (jwt) saveSessionTokens({ accessToken: jwt });
        setTimeout(() => router.push("/login?verified=true"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Error al verificar la cuenta. El enlace puede haber expirado.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center space-y-4"
      >
        {status === "loading" && (
          <>
            <Loader2 size={48} className="mx-auto text-[#81af6d] animate-spin" />
            <h2 className="text-xl font-bold text-gray-900">Verificando tu cuenta...</h2>
            <p className="text-gray-500">Estamos validando tu token de verificación.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">¡Cuenta Verificada!</h2>
            <p className="text-gray-500">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={48} className="mx-auto text-red-400" />
            <h2 className="text-xl font-bold text-gray-900">Error de Verificación</h2>
            <p className="text-gray-500">{message}</p>
          </>
        )}
        <div className="pt-4">
          <Mail size={32} className="mx-auto text-gray-300" />
          <p className="text-xs text-gray-400 mt-2">FurMatch</p>
        </div>
      </motion.div>
    </div>
  );
}
