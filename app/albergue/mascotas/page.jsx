"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dog, Plus, Pencil, ToggleRight, Eye, Search, Trash2, X, Filter } from "lucide-react";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import PetDetailModal from "@/features/shared/components/PetDetailModal";
import MascotaEstadoModal from "@/features/albergue/components/mascota-estado/MascotaEstadoModal";
import { getMisMascotas, deleteMascota } from "@/features/albergue/services/mascota.service";

function EstadoBadge({ estado }) {
  const estilos = {
    disponible: "bg-emerald-50 text-emerald-700 border-emerald-100",
    en_proceso: "bg-amber-50 text-amber-700 border-amber-100",
    adoptado: "bg-blue-50 text-blue-700 border-blue-100",
    pausado: "bg-gray-50 text-gray-600 border-gray-100",
    oculto: "bg-red-50 text-red-700 border-red-100",
    inactivo: "bg-gray-50 text-gray-500 border-gray-100",
    archivado: "bg-gray-50 text-gray-400 border-gray-100",
  };

  const nombres = {
    disponible: "Disponible",
    en_proceso: "En proceso",
    adoptado: "Adoptado",
    pausado: "Pausado",
    oculto: "Oculto",
    inactivo: "Inactivo",
    archivado: "Archivado",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estilos[estado] || estilos.inactivo}`}
    >
      {nombres[estado] || estado}
    </span>
  );
}

export default function MisMascotasPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMascotaId, setSelectedMascotaId] = useState(null);
  const [selectedPetForState, setSelectedPetForState] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mascotaAEliminar, setMascotaAEliminar] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [eliminando, setEliminando] = useState(false);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleEstadoChange = (e) => {
    setEstadoFiltro(e.target.value);
    setPage(1);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["mis-mascotas", page, estadoFiltro, searchTerm],
    queryFn: () => getMisMascotas({ page, limit: 10, estado: estadoFiltro, busqueda: searchTerm }),
  });

  const mascotas = data?.data || [];
  const meta = data?.meta || {};

  const abrirModalEliminar = (mascota) => {
    setMascotaAEliminar(mascota);
    setMotivo("");
    setModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!mascotaAEliminar || !motivo.trim()) return;
    setEliminando(true);
    try {
      await deleteMascota(mascotaAEliminar.id_mascota, motivo.trim());
      queryClient.invalidateQueries({ queryKey: ["mis-mascotas"] });
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar la mascota");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <ClientAuthGuard allowedRoles={["albergue"]}>
      <div className="min-h-screen bg-[#fafaf8]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Mascotas</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona las mascotas que has publicado en FurMatch
            </p>
          </div>
          <button
            onClick={() => router.push("/albergue/mascotas/publicar")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white rounded-full text-sm font-semibold transition-colors"
          >
            <Plus size={18} />
            Publicar nueva
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar por nombre..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/20 focus:border-[#8b9e7e] transition-all"
            />
          </div>
          <select
            value={estadoFiltro}
            onChange={handleEstadoChange}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/20 focus:border-[#8b9e7e] transition-all min-w-[160px]"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="en_proceso">En proceso</option>
            <option value="adoptado">Adoptado</option>
            <option value="oculto">Oculto</option>
            <option value="inactivo">Inactivo</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>

        {/* Tabla / Grid */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">Error al cargar tus mascotas.</p>
            <p className="text-gray-400 text-sm mt-1">Intenta de nuevo más tarde.</p>
          </div>
        ) : mascotas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Aún no has publicado ninguna mascota.</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              Publica tu primera mascota para empezar a recibir solicitudes de adopción.
            </p>
            <button
              onClick={() => router.push("/albergue/mascotas/publicar")}
              className="px-6 py-2.5 bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white rounded-full text-sm font-semibold transition-colors"
            >
              Publicar mascota
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">
                      Mascota
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">
                      Estado
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">
                      Publicación
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mascotas.map((mascota) => (
                    <tr key={mascota.id_mascota} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {mascota.foto ? (
                              <img
                                src={mascota.foto}
                                alt={mascota.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Dog size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{mascota.nombre}</p>
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">
                              {mascota.descripcion}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <EstadoBadge estado={mascota.estado_adopcion} />
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-500">
                          {new Date(mascota.fecha_publicacion).toLocaleDateString("es-CO")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            onClick={() => setSelectedMascotaId(mascota.id_mascota)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => router.push(`/albergue/mascotas/${mascota.id_mascota}/editar`)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-[#7a9e6a] hover:bg-[#f0f5ec] rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedPetForState(mascota.id_mascota)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Cambiar estado"
                          >
                            <ToggleRight size={16} />
                          </button>
                          <button
                            onClick={() => abrirModalEliminar(mascota)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {meta.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {page} de {meta.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                  disabled={page >= meta.pages}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        {modalOpen && mascotaAEliminar && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Eliminar mascota</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Estas por eliminar <strong>{mascotaAEliminar.nombre}</strong>. Esta accion no se puede deshacer.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de eliminacion <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: La mascota fue adoptada fuera de la plataforma"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminar}
                  disabled={!motivo.trim() || eliminando}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  {eliminando ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Modal de detalle de mascota */}
      <PetDetailModal
        mascotaId={selectedMascotaId}
        onClose={() => setSelectedMascotaId(null)}
      />

      {/* Modal de cambio de estado */}
      <MascotaEstadoModal
        mascotaId={selectedPetForState}
        onClose={() => {
          setSelectedPetForState(null);
          queryClient.invalidateQueries({ queryKey: ["mis-mascotas"] });
        }}
      />
    </ClientAuthGuard>
  );
}
