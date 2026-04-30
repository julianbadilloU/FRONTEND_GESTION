"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <LoginForm
        onSuccess={({ email, role }) => {
          if (role === "adoptante") {
            router.push("/adoptante/feed");
          } else if (role === "albergue") {
            router.push("/albergue/mascotas");
          } else if (role === "administrador") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }}
      />
    </AnimatePresence>
  );
}
