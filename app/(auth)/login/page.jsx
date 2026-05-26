"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <LoginForm
        onSuccess={({ email, role, estado_cuenta }) => {
          // Si el perfil está incompleto, redirigir al onboarding correspondiente
          if (estado_cuenta === "perfil_incompleto") {
            if (role === "adoptante") {
              router.push("/adoptante/onboarding");
            } else if (role === "albergue") {
              router.push("/albergue/onboarding");
            } else {
              router.push("/");
            }
            return;
          }

          // Perfil completo → redirigir al dashboard según rol
          if (role === "adoptante") {
            router.push("/adoptante/feed");
          } else if (role === "albergue") {
            router.push("/albergue/mascotas");
          } else if (role === "administrador") {
            router.push("/admin/dashboard");
          } else {
            router.push("/");
          }
        }}
      />
    </AnimatePresence>
  );
}
