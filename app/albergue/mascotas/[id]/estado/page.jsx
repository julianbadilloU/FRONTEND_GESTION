"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { MascotaEstado } from "@/features/albergue/components/mascota-estado/MascotaEstado";
import { getMascota } from "@/features/albergue/services/mascota.service";

export default function MascotaEstadoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const { data: mascota, isLoading, isError } = useQuery({
    queryKey: ["mascota", id],
    queryFn: () => getMascota(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5e924e]"></div>
      </div>
    );
  }

  if (isError || !mascota) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-bold text-gray-800">Error al cargar la mascota</h2>
        <p className="text-gray-600">No se pudo encontrar la mascota o hubo un problema de conexión.</p>
        <button
          onClick={() => router.push("/albergue/mascotas")}
          className="px-4 py-2 bg-[#5e924e] text-white rounded-md font-medium"
        >
          Volver a Mis Mascotas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <MascotaEstado mascota={mascota} />
    </div>
  );
}
