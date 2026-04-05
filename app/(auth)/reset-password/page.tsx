"use client";

import { AnimatePresence } from "framer-motion";

import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AnimatePresence mode="wait">
      <ResetPasswordForm />
    </AnimatePresence>
  );
}
