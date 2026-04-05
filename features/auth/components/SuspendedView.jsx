"use client";

import { Info } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { AuthAlert } from "@/features/auth/components/AuthAlert";
import { AuthButton } from "@/features/auth/components/AuthButton";

export function SuspendedView() {
  return (
    <motion.div
      key="suspended"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 text-center"
    >
      <div className="w-24 h-24 bg-red-100 rounded-3xl shadow-xl shadow-red-200/50 mx-auto flex items-center justify-center text-5xl">
        ⛔
      </div>
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-gray-900 leading-tight">
          Cuenta Suspendida
        </h1>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          Lamentamos informarte que tu acceso ha sido restringido temporalmente.
        </p>
      </div>

      <AuthAlert type="error" title="Motivo del Bloqueo">
        Actividad sospechosa o incumplimiento de los lineamientos de bienestar animal.
      </AuthAlert>

      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3 text-left">
        <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed font-medium">
          Si crees que se trata de un error, puedes solicitar una revisión detallada enviando
          evidencia a soporte.
        </p>
      </div>

      <div className="space-y-4">
        <AuthButton variant="danger" type="button">
          Contactar Soporte
        </AuthButton>
        <Link
          href="/login"
          className="block text-sm font-bold text-gray-400 hover:text-sage-600 transition-colors"
        >
          Cerrar Sesión
        </Link>
      </div>
    </motion.div>
  );
}
