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
          // Si el perfil está incompleto, redirigir al onboarding correspondiente.
          // Admin y otros roles sin onboarding van directo a su dashboard.
          if (estado_cuenta === "perfil_incompleto") {
            if (role === "adoptante") {
              router.push("/adoptante/onboarding");
              return;
            }
            if (role === "albergue") {
              router.push("/albergue/onboarding");
              return;
            }
          }

          // Perfil completo (o roles sin onboarding como admin) → dashboard según rol
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
