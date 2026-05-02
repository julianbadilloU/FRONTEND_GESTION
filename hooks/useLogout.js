"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth/auth-service";

/**
 * Hook que ejecuta logoutUser() y redirige a /login.
 * Maneja errores de red y estados de carga.
 */
export function useLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    await logoutUser();
    router.push("/login");
  }, [router]);

  return { logout };
}
