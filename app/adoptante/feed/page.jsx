"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dog, Cat, Search, Filter, Heart, MapPin, Calendar, Zap } from "lucide-react";
import { getFeedMascotas, getMatchMascotas } from "@/features/adoptante/services/adoptante.service";

function MascotaCard({ mascota, compatibilidad }) {
  const router = useRouter();
  const tipoTag = mascota.tags?.find((t) => t.nombre_tag === "Tipo de animal");
  const tamañoTag = mascota.tags?.find((t) => t.nombre_tag === "Tamaño");
  const edadTag = mascota.tags?.find((t) => t.nombre_tag === "Rango de edad");

  const pct = compatibilidad ?? null;

  return (
    <div
      onClick={() => router.push(`/mascota/${mascota.id_mascota}`)}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {mascota.foto ? (
          <img
            src={mascota.foto}
            alt={mascota.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            {tipoTag?.valor === "Gato" ? <Cat size={48} /> : <Dog size={48} />}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <Heart size={18} className="text-gray-400 hover:text-red-400 transition-colors" />
        </div>
        {pct !== null && (
          <div className="absolute top-3 left-3 bg-[#8b9e7e] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Zap size={12} />
            {pct}% match
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">{mascota.nombre}</h3>
          <span className="text-xs font-semibold px-2 py-1 bg-[#e8f0e4] text-[#5a7d4a] rounded-full">
            {edadTag?.valor || "Edad desconocida"}
          </span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2">{mascota.descripcion}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          {tipoTag && (
            <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">
              {tipoTag.valor}
            </span>
          )}
          {tamañoTag && (
            <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">
              {tamañoTag.valor}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {mascota.ciudad || "Ubicación no disponible"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(mascota.fecha_publicacion).toLocaleDateString("es-CO")}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-50">
          <p className="text-xs font-medium text-[#7a9e6a]">
            {mascota.nombre_albergue}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [filtros, setFiltros] = useState({ tipo: "", tamaño: "", edad: "" });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { data: feedData, isLoading: feedLoading, error: feedError } = useQuery({
    queryKey: ["feed", filtros],
    queryFn: () => getFeedMascotas({ ...filtros, page: 1, limit: 20 }),
  });

  const { data: matchData } = useQuery({
    queryKey: ["match"],
    queryFn: getMatchMascotas,
    enabled: !feedLoading && !feedError,
  });

  const mascotas = feedData?.data || [];
  const compatibilidadMap = new Map();
  if (matchData?.data) {
    matchData.data.forEach((m) => {
      if (m.id_mascota && m.compatibilidad) {
        compatibilidadMap.set(m.id_mascota, m.compatibilidad);
      }
    });
  }

  const isLoading = feedLoading;
  const error = feedError;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Encuentra tu{" "}
              <span className="font-serif italic font-normal text-[#81af6d]">match</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Explora las mascotas disponibles para adopción
            </p>
          </div>
          <button
            onClick={() => setMostrarFiltros((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter size={16} />
            Filtros
          </button>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a9c99a]"
            >
              <option value="">Tipo de animal</option>
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
            </select>

            <select
              value={filtros.tamaño}
              onChange={(e) => setFiltros((f) => ({ ...f, tamaño: e.target.value }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a9c99a]"
            >
              <option value="">Tamaño</option>
              <option value="Pequeño">Pequeño</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>

            <select
              value={filtros.edad}
              onChange={(e) => setFiltros((f) => ({ ...f, edad: e.target.value }))}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a9c99a]"
            >
              <option value="">Edad</option>
              <option value="Cachorro (0-1)">Cachorro</option>
              <option value="Joven (1-3)">Joven</option>
              <option value="Adulto (3-7)">Adulto</option>
              <option value="Senior (7+)">Senior</option>
            </select>

            <button
              onClick={() => setFiltros({ tipo: "", tamaño: "", edad: "" })}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar
            </button>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">Error al cargar las mascotas.</p>
            <p className="text-gray-400 text-sm mt-1">Intenta de nuevo más tarde.</p>
          </div>
        ) : mascotas.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No se encontraron mascotas con estos filtros.</p>
            <p className="text-gray-400 text-sm mt-1">Prueba con otros criterios de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mascotas.map((mascota) => (
              <MascotaCard
                key={mascota.id_mascota}
                mascota={mascota}
                compatibilidad={compatibilidadMap.get(mascota.id_mascota)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
