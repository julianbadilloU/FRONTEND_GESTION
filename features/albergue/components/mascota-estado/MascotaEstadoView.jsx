"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import MascotaEstadoForm from "./MascotaEstadoForm";

export function MascotaEstadoView() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-[#d5d0c8] rounded-full px-4 py-2 transition-colors bg-white shadow-sm"
        >
          <ChevronLeft size={16} />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900 font-serif italic">
          Estado de Mascota
        </h1>
      </div>

      <div className="bg-[#f0ede8] rounded-3xl p-8 sm:p-10 shadow-sm border border-[#e5e0d8]">
        <MascotaEstadoForm
          mascotaId={id}
          onSuccess={() => {
            // Toast is handled inside the form — stay on page after success
          }}
          onCancel={() => router.back()}
        />
      </div>
    </main>
  );
}
