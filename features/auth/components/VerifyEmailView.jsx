"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { AuthAlert } from "@/features/auth/components/AuthAlert";
import { AuthButton } from "@/features/auth/components/AuthButton";

export function VerifyEmailView({ email }) {
  return (
    <motion.div
      key="verify"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 text-center"
    >
      <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-sage-200/50 mx-auto flex items-center justify-center text-5xl animate-bounce">
        📬
      </div>
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-gray-900">¡Casi listo!</h1>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">
          Enviamos un código mágico a
          <br />
          {email && (
            <strong className="text-gray-800 font-bold px-2 py-1 bg-sage-50 rounded-lg">
              {email}
            </strong>
          )}
        </p>
      </div>

      <AuthAlert type="ok">
        Si no lo ves, revisa tu carpeta de <strong>Spam</strong> o correos no deseados.
      </AuthAlert>

      <div className="space-y-4 text-left">
        {[
          { step: 1, text: "Abre tu correo de FurMatch." },
          { step: 2, text: 'Pulsa el botón "Verificar Cuenta".' },
          { step: 3, text: "¡Recibe todo el amor🐾!" },
        ].map((s) => (
          <div
            key={s.step}
            className="flex gap-4 items-center p-3 bg-white/50 rounded-2xl border border-white"
          >
            <span className="w-8 h-8 rounded-full bg-sage-100 text-sage-600 font-bold flex items-center justify-center text-sm">
              {s.step}
            </span>
            <p className="text-sm text-gray-600 font-medium">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <AuthButton variant="primary" type="button">
          Reenviar Correo
        </AuthButton>
        <Link href="/login">
          <AuthButton variant="ghost" className="flex items-center justify-center gap-2">
            <ChevronLeft size={16} /> Volver al Inicio
          </AuthButton>
        </Link>
      </div>
    </motion.div>
  );
}
