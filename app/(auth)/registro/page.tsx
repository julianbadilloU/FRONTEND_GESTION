"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import { SignupForm } from "@/features/auth/components/SignupForm";
import { VerifyEmailView } from "@/features/auth/components/VerifyEmailView";

export default function RegistroPage() {
  const router = useRouter();
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  if (verifyEmail) {
    return (
      <AnimatePresence mode="wait">
        <VerifyEmailView email={verifyEmail} />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <SignupForm onSuccess={(email) => setVerifyEmail(email)} />
    </AnimatePresence>
  );
}
