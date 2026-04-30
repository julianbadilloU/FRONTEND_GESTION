"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dog, Cat, ArrowLeft, MapPin, Calendar, Heart, Share2 } from "lucide-react";
import { getMascotaById } from "@/features/albergue/services/mascota.service";

export default function MascotaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["mascota", id],
    queryFn: () => getMascotaById(id),
    enabled: !!id,
  });

  const mascota = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm font-medium">Cargando mascota...</div>
      </div>
    );
  }

  if (error || !mascota) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Mascota no encontrada.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 text-sm text-[#7a9e6a] hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const tipoTag = mascota.tags?.find((t) => t.nombre_tag === "Tipo de animal");
  const tamañoTag = mascota.tags?.find((t) => t.nombre_tag === "Tamaño");
  const edadTag = mascota.tags?.find((t) => t.nombre_tag === "Rango de edad");
  const sexoTag = mascota.tags?.find((t) => t.nombre_tag === "Sexo");
  const energiaTag = mascota.tags?.find((t) => t.nombre_tag === "Nivel de energía");

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Fotos */}
          <div className="relative h-80 bg-gray-100">
            {mascota.fotos?.[0] ? (
              <img
                src={mascota.fotos[0].url_foto}
                alt={mascota.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                {tipoTag?.valor === "Gato" ? <Cat size={64} /> : <Dog size={64} />}
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-400 transition-colors">
                <Heart size={18} />
              </button>
              <button className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-gray-800 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Title + tags */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{mascota.nombre}</h1>
                <p className="text-sm text-[#7a9e6a] font-medium mt-1">
                  {mascota.nombre_albergue}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {tipoTag && (
                  <span className="px-3 py-1 bg-[#f0f5ec] text-[#5a7d4a] text-xs font-semibold rounded-full">
                    {tipoTag.valor}
                  </span>
                )}
                {tamañoTag && (
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                    {tamañoTag.valor}
                  </span>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {edadTag && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {edadTag.valor}
                </span>
              )}
              {sexoTag && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  {sexoTag.valor}
                </span>
              )}
              {energiaTag && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  {energiaTag.valor}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                Publicado el {new Date(mascota.fecha_publicacion).toLocaleDateString("es-CO")}
              </span>
            </div>

            {/* Descripción */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Sobre {mascota.nombre}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {mascota.descripcion || "Sin descripción disponible."}
              </p>
            </div>

            {/* Tags */}
            {mascota.tags?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Características</h2>
                <div className="flex flex-wrap gap-2">
                  {mascota.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100"
                    >
                      <span className="font-medium text-gray-400">{tag.nombre_tag}:</span>{" "}
                      {tag.valor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-4 border-t border-gray-50">
              <button className="w-full py-3.5 bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white font-semibold rounded-xl transition-colors">
                Contactar albergue por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
