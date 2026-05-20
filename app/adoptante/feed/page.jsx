"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dog, Cat, Search, Filter, Heart, MapPin, Calendar, RefreshCw } from "lucide-react";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import { getFeedMascotas, getMatchMascotas } from "@/features/adoptante/services/adoptante.service";
import { CompatibilityBadge, CompatibilityBar, getCompatibilityLevel } from "@/features/adoptante/components/feed/CompatibilityBadge";
import { SwipeFeed } from "@/features/adoptante/components/feed/SwipeFeed";

// ─── Constantes de queryKey (única fuente de verdad) ──────────────────────────
export const MATCH_QUERY_KEY = ["match"];
export const FEED_QUERY_KEY_PREFIX = "feed";

// ─── Tarjeta de mascota ───────────────────────────────────────────────────────
function MascotaCard({ mascota, compatibilidad }) {
  const router = useRouter();
  const tipoTag = mascota.tags?.find((t) => t.nombre_tag === "Tipo de animal");
  const tamañoTag = mascota.tags?.find((t) => t.nombre_tag === "Tamaño");
  const edadTag = mascota.tags?.find(
    (t) => t.nombre_tag === "Edad" || t.nombre_tag === "Rango de edad"
  );

  const pct = compatibilidad ?? null;
  const level = pct !== null ? getCompatibilityLevel(pct) : null;

  // Borde de tarjeta según nivel de compatibilidad (HU-MT-01 Frontend)
  const borderClass =
    level?.level === "alto"
      ? "border-[#4a7c59]/40 hover:border-[#4a7c59]/70"
      : level?.level === "bueno"
      ? "border-[#c9a52d]/40 hover:border-[#c9a52d]/70"
      : level?.level === "aceptable"
      ? "border-[#d4841b]/30 hover:border-[#d4841b]/60"
      : "border-gray-100 hover:border-gray-200";

  return (
    <div
      id={`mascota-card-${mascota.id_mascota}`}
      onClick={() => router.push(`/mascota/${mascota.id_mascota}`)}
      className={`group bg-white rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${borderClass}`}
    >
      {/* Imagen */}
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

        {/* Botón favorito */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
          <Heart size={18} className="text-gray-400 hover:text-red-400 transition-colors" />
        </div>

        {/* Badge de compatibilidad (posición destacada top-left) */}
        {pct !== null && (
          <div className="absolute top-3 left-3">
            <CompatibilityBadge pct={pct} />
          </div>
        )}
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">{mascota.nombre}</h3>
          <span className="text-xs font-semibold px-2 py-1 bg-[#e8f0e4] text-[#5a7d4a] rounded-full">
            {edadTag?.valor || "Edad desconocida"}
          </span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2">{mascota.descripcion}</p>

        {/* Tags de tipo y tamaño */}
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

        {/* Barra de compatibilidad (visible siempre que haya pct) */}
        {pct !== null && <CompatibilityBar pct={pct} />}

        {/* Ubicación y fecha */}
        <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
          {mascota.nombre_albergue && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {mascota.nombre_albergue}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(mascota.fecha_publicacion).toLocaleDateString("es-CO")}
          </span>
        </div>

        {/* Albergue */}
        <div className="pt-2 border-t border-gray-50">
          <p className="text-xs font-medium text-[#7a9e6a]">{mascota.nombre_albergue}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal del Feed ─────────────────────────────────────────────────
export default function FeedPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("para-ti");
  const [filtros, setFiltros] = useState({ tipo: "", tamaño: "", edad: "" });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Query: feed de mascotas ──────────────────────────────────────────────────
  const {
    data: feedData,
    isLoading: feedLoading,
    error: feedError,
  } = useQuery({
    queryKey: [FEED_QUERY_KEY_PREFIX, filtros],
    queryFn: () => getFeedMascotas({ ...filtros, page: 1, limit: 20 }),
  });

  // ── Query: matching (staleTime:0 → siempre fresco tras invalidación) ─────────
  const { data: matchData, isFetching: matchFetching } = useQuery({
    queryKey: MATCH_QUERY_KEY,
    queryFn: getMatchMascotas,
    enabled: !feedLoading && !feedError,
    staleTime: 0,          // nunca usar caché obsoleto
    gcTime: 5 * 60_000,   // retener 5 min en memoria
  });

  // ── Mapear compatibilidad por id_mascota ─────────────────────────────────────
  const mascotas = feedData?.data || [];
  const compatibilidadMap = new Map();
  if (matchData?.data) {
    matchData.data.forEach((m) => {
      if (m.id_mascota && m.compatibilidad !== undefined) {
        compatibilidadMap.set(m.id_mascota, m.compatibilidad);
      }
    });
  }

  const isLoading = feedLoading;
  const error = feedError;

  // ── Recálculo manual del matching ────────────────────────────────────────────
  const handleRefreshMatch = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEY });
    setIsRefreshing(false);
  };

  return (
    <ClientAuthGuard allowedRoles={["adoptante"]}>
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

            <div className="flex items-center gap-2">
              {/* Botón recalcular matching */}
              <button
                id="btn-refresh-match"
                onClick={handleRefreshMatch}
                disabled={isRefreshing || matchFetching}
                title="Recalcular compatibilidad"
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={isRefreshing || matchFetching ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Actualizar match</span>
              </button>

              {/* Botón filtros */}
              {activeTab === "explorar" && (
                <button
                  id="btn-filtros"
                  onClick={() => setMostrarFiltros((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Filter size={16} />
                  Filtros
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("para-ti")}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "para-ti"
                  ? "border-[#81af6d] text-[#5a7d4a]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Para ti
            </button>
            <button
              onClick={() => setActiveTab("explorar")}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "explorar"
                  ? "border-[#81af6d] text-[#5a7d4a]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Explorar
            </button>
          </div>

          {/* Panel de filtros */}
          {activeTab === "explorar" && mostrarFiltros && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
              <select
                id="filtro-tipo"
                value={filtros.tipo}
                onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a9c99a]"
              >
                <option value="">Tipo de animal</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>

              <select
                id="filtro-tamaño"
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
                id="filtro-edad"
                value={filtros.edad}
                onChange={(e) => setFiltros((f) => ({ ...f, edad: e.target.value }))}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#a9c99a]"
              >
                <option value="">Edad</option>
                <option value="Cachorro (0–1 año)">Cachorro</option>
                <option value="Joven (1–3 años)">Joven</option>
                <option value="Adulto (3–7 años)">Adulto</option>
                <option value="Senior (+7 años)">Senior</option>
              </select>

              <button
                id="btn-limpiar-filtros"
                onClick={() => setFiltros({ tipo: "", tamaño: "", edad: "" })}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar
              </button>
            </div>
          )}

          {/* Contenido según Tab */}
          {activeTab === "para-ti" ? (
            <SwipeFeed />
          ) : (
            <>
              {/* Grid de mascotas */}
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
                      compatibilidad={compatibilidadMap.get(mascota.id_mascota) ?? null}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ClientAuthGuard>
  );
}
