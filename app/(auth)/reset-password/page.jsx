import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";

import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#a9c99a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AnimatePresence mode="wait">
        <ResetPasswordForm />
      </AnimatePresence>
    </Suspense>
  );
}
