"use client";

import { Suspense } from "react"; // 1. Importamos Suspense
import { AnimatePresence } from "framer-motion";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    // El fallback puede ser un spinner o simplemente null
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <AnimatePresence mode="wait">
        <ResetPasswordForm />
      </AnimatePresence>
    </Suspense>
  );
}