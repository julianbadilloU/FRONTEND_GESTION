"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { logoutUser } from "@/lib/auth/auth-service";

/**
 * Botón de logout con dos variantes:
 * - "icon": solo icono (para navbars, compacto)
 * - "full": texto + icono (para menús, uso general)
 */
export function LogoutButton({ variant = "full", className = "" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logoutUser();
    } catch {
      // logoutUser ya limpia los tokens incluso si falla
    } finally {
      router.push("/login");
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={`flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 ${className}`}
        title="Cerrar sesión"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <LogOut size={18} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border border-[#e2d9cf] bg-white text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Cerrando sesión…
        </>
      ) : (
        <>
          <LogOut size={16} />
          Cerrar Sesión
        </>
      )}
    </button>
  );
}
