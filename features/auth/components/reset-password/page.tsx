"use client";

import { AnimatePresence } from "framer-motion";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AnimatePresence mode="wait">
        <ResetPasswordForm />
      </AnimatePresence>
    </div>
  );
}