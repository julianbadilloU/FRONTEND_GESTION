"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  const normalizeRole = (role) => {
    const normalized = (role || "").toString().toLowerCase();

    if (normalized === "administrador") return "admin";

    return normalized;
  };

  return (
    <AnimatePresence mode="wait">
      <LoginForm
        onSuccess={({ email, role, estado_cuenta }) => {
          const normalizedRole = normalizeRole(role);

          // Si el perfil está incompleto, redirigir al onboarding correspondiente
          if (estado_cuenta === "perfil_incompleto") {
            if (normalizedRole === "adoptante") {
              router.push("/adoptante/onboarding");
            } else if (normalizedRole === "albergue") {
              router.push("/albergue/onboarding");
            } else {
              router.push("/");
            }
            return;
          }

          // Perfil completo → redirigir al dashboard según rol
          if (normalizedRole === "adoptante") {
            router.push("/adoptante/feed");
          } else if (normalizedRole === "albergue") {
            router.push("/albergue/mascotas");
          } else if (normalizedRole === "admin") {
            router.push("/admin/tags");
          } else {
            router.push("/");
          }
        }}
      />
    </AnimatePresence>
  );
}
