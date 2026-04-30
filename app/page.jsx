"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = window.localStorage.getItem("furmatch.access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      // Decodificar payload del JWT para obtener rol
      const payload = JSON.parse(atob(token.split(".")[1]));
      const rol = payload?.role || payload?.rol;

      if (rol === "adoptante") {
        router.replace("/adoptante/feed");
      } else if (rol === "albergue") {
        router.replace("/albergue/mascotas");
      } else if (rol === "administrador") {
        router.replace("/admin/tags");
      } else {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <div className="animate-pulse text-gray-400 text-sm font-medium">
        Cargando FurMatch...
      </div>
    </div>
  );
}
