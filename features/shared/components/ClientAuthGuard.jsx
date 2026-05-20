"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Client-side auth guard.
 * Verifica que exista un token válido antes de renderizar contenido protegido.
 * Si no hay token → redirige a /login inmediatamente (sin mostrar contenido).
 */
export function ClientAuthGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    try {
      const token = window.localStorage.getItem("furmatch.access_token");
      
      if (!token) {
        // No hay token → redirigir inmediatamente
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Decodificar payload para verificar rol
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRole = payload?.role || payload?.rol;
      const userEstadoCuenta = payload?.estado_cuenta;

      // Si el perfil está incompleto y no estamos en onboarding, redirigir
      if (userEstadoCuenta === "perfil_incompleto" && !pathname.includes("/onboarding")) {
        const onboardingPath =
          userRole === "adoptante"
            ? "/adoptante/onboarding"
            : userRole === "albergue"
            ? "/albergue/onboarding"
            : null;

        if (onboardingPath) {
          router.replace(onboardingPath);
          return;
        }
      }

      // Si se especifican roles permitidos, verificar
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Rol no autorizado → redirigir según su rol
        const redirectPath =
          userRole === "adoptante"
            ? "/adoptante/feed"
            : userRole === "albergue"
            ? "/albergue/mascotas"
            : userRole === "administrador"
            ? "/admin/tags"
            : "/login";
        
        router.replace(redirectPath);
        return;
      }

      // Todo OK
      setIsAuthorized(true);
    } catch {
      // Token inválido → redirigir
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } finally {
      setIsChecking(false);
    }
  }, [router, pathname, allowedRoles]);

  // Mientras verifica → mostrar spinner (NO mostrar contenido)
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#8b9e7e]" />
          <p className="text-gray-500 text-sm font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autorizado → null (la redirección ya se disparó)
  if (!isAuthorized) {
    return null;
  }

  // Autorizado → renderizar contenido
  return children;
}
