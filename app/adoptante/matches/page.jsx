"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import PetDetailModal from "@/features/shared/components/PetDetailModal";
import { getMatchesAdoptante } from "@/features/adoptante/services/match.service";
import { getDescartes, deshacerDescarte } from "@/features/adoptante/services/adoptante.service";
import { MatchCard } from "@/features/adoptante/components/matches/MatchCard";

// ─── Constantes ───────────────────────────────────────────────────────────────

export const MATCHES_QUERY_KEY = "matchesHistorial";
const LIMIT = 10;

const ESTADO_TABS = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "aceptado", label: "Aceptados" },
  { value: "rechazado", label: "Rechazados" },
  { value: "adoptado", label: "Adoptados" },
  { value: "descartado", label: "Descartados" },
];

// ─── Skeleton de carga ────────────────────────────────────────────────────────

function MatchSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex h-32 animate-pulse">
      <div className="w-28 sm:w-36 bg-gray-200 shrink-0" />
      <div className="flex-1 p-4 space-y-3">
        <div className="flex justify-between gap-4">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const router = useRouter();
  const [estadoTab, setEstadoTab] = useState("");
  const [offset, setOffset] = useState(0);
  const [selectedMascotaId, setSelectedMascotaId] = useState(null);

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: [MATCHES_QUERY_KEY, estadoTab, offset],
    queryFn: () =>
      estadoTab === "descartado"
        ? getDescartes()
        : getMatchesAdoptante({ estado: estadoTab, limit: LIMIT, offset }),
    keepPreviousData: true,
  });

  const rawData = estadoTab === "descartado" ? (data ?? []) : (data?.data ?? []);
  // Para descartes, adaptar el formato para que funcione con MatchCard
  const matches = estadoTab === "descartado"
    ? rawData.map(d => ({
        id_match: `descarte-${d.id_mascota}`,
        id_mascota: d.id_mascota,
        fecha_match: d.fecha || new Date().toISOString(),
        estado: 'descartado',
        mascota: d.mascota,
        albergue: d.mascota?.albergue,
      }))
    : rawData;
  const pagination = data?.pagination ?? { total: 0, limit: LIMIT, offset: 0 };
  const totalPages = Math.ceil(pagination.total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTabChange = (value) => {
    setEstadoTab(value);
    setOffset(0);
  };

  const handlePrevPage = () => setOffset((prev) => Math.max(0, prev - LIMIT));
  const handleNextPage = () => setOffset((prev) => prev + LIMIT);

  return (
    <ClientAuthGuard allowedRoles={["adoptante"]}>
      <div className="min-h-screen bg-[#fafaf8]">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <Heart size={22} className="text-[#e07a5f]" fill="#e07a5f" />
              <h1 className="text-2xl font-bold text-gray-900">Mis Matches</h1>
            </div>
            <p className="text-gray-500 text-sm">
              Revisa el historial de mascotas con las que has hecho match.
            </p>
          </div>

          {/* Tabs de estado */}
          <div
            id="tabs-estado"
            role="tablist"
            aria-label="Filtrar por estado"
            className="flex gap-2 flex-wrap mb-6"
          >
            {ESTADO_TABS.map((tab) => (
              <button
                key={tab.value}
                id={`tab-${tab.value || "todos"}`}
                role="tab"
                aria-selected={estadoTab === tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  estadoTab === tab.value
                    ? "bg-[#4a7c59] text-white border-[#4a7c59]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <MatchSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-medium">
                Error al cargar tu historial de matches.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Intenta de nuevo más tarde.
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div
              id="empty-matches"
              className="text-center py-20"
            >
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                No tienes matches{estadoTab ? ` con estado "${estadoTab}"` : ""} aún.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Explora mascotas en el feed para comenzar.
              </p>
              <button
                id="btn-ir-feed"
                onClick={() => router.push("/adoptante/feed")}
                className="mt-6 px-5 py-2.5 bg-[#4a7c59] text-white rounded-full text-sm font-semibold hover:bg-[#3d6649] transition-colors"
              >
                Explorar mascotas
              </button>
            </div>
          ) : estadoTab === "descartado" ? (
            /* ─── Lista de Descartados (tabla) ─── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mascota</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Albergue</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {matches.map((d) => (
                    <tr key={d.id_match} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div
                          onClick={() => setSelectedMascotaId(d.id_mascota)}
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={d.mascota?.mascota_foto?.[0]?.url_foto || "/default-avatar.svg"}
                            alt={d.mascota?.nombre}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="font-medium text-gray-900 text-sm hover:text-[#5e924e] hover:underline">
                            {d.mascota?.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <span className="text-sm text-[#7a9e6a]">{d.albergue?.nombre_albergue}</span>
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-400">
                          {new Date(d.fecha_match).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm("¿Recuperar esta mascota?")) {
                              deshacerDescarte(d.id_mascota).then(() => {
                                setEstadoTab("");
                                setTimeout(() => setEstadoTab("descartado"), 100);
                              });
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-colors"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matches.length === 0 && (
                <div className="text-center py-16">
                  <Search size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No tenés mascotas descartadas.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Lista de matches */}
              <div
                id="lista-matches"
                className="space-y-4"
                role="list"
                aria-label="Lista de matches"
              >
                {matches.map((match) => (
                  <div key={match.id_match} role="listitem">
                    <MatchCard
                      match={match}
                      onClick={() => {
                        if (estadoTab === "descartado") {
                          if (confirm("¿Querés recuperar esta mascota? Volverá a aparecer en Descubrir.")) {
                            deshacerDescarte(match.id_mascota).then(() => {
                              setEstadoTab("");
                              setTimeout(() => setEstadoTab("descartado"), 100);
                            });
                          }
                        } else {
                          router.push(`/adoptante/matches/${match.id_match}`);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div
                  id="paginacion-matches"
                  className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100"
                >
                  <button
                    id="btn-pagina-anterior"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>

                  <span className="text-sm text-gray-500">
                    Página <span className="font-semibold text-gray-700">{currentPage}</span>{" "}
                    de <span className="font-semibold text-gray-700">{totalPages}</span>
                  </span>

                  <button
                    id="btn-pagina-siguiente"
                    onClick={handleNextPage}
                    disabled={offset + LIMIT >= pagination.total}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Modal de detalle de mascota */}
      <PetDetailModal
        mascotaId={selectedMascotaId}
        onClose={() => setSelectedMascotaId(null)}
      />
    </ClientAuthGuard>
  );
}
