"use client";

import { Suspense } from "react";
import { NuevaContrasenaForm } from "@/features/auth/components/NuevaContrasenaForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#a9c99a] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NuevaContrasenaForm />
    </Suspense>
  );
}
