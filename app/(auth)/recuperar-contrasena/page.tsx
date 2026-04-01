"use client";

import { AnimatePresence } from "framer-motion";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function RecuperarContrasenaPage() {
  return (
    <AnimatePresence mode="wait">
      <ForgotPasswordForm />
    </AnimatePresence>
  );
}
