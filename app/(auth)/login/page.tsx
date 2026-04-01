"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <LoginForm
        onSuccess={(email) => {
          // TODO: redirect to role-based dashboard once protected routes exist
          router.push("/");
        }}
      />
    </AnimatePresence>
  );
}
