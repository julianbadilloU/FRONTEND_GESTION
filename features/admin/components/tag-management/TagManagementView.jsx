"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Plus, Tag as TagIcon, Loader2 } from "lucide-react";
import { TagTable } from "./TagTable";
import { TagFilters } from "./TagFilters";
import { TagModal } from "./TagModal";
import { Toast } from "@/features/shared/components/Toast";
import { getTags, deleteTag } from "@/features/admin/services/tag.service";

const MOCK_TAGS = [
  { id: 1, nombre: "Nivel de Energía", tipo: "categorico", peso: 0.8, filtro_absoluto: false, activo: true, opciones: [{ id: 101, nombre: "Bajo" }, { id: 102, nombre: "Medio" }, { id: 103, nombre: "Alto" }] },
  { id: 2, nombre: "Espacio Requerido", tipo: "categorico", peso: 0.9, filtro_absoluto: true, activo: true, opciones: [{ id: 201, nombre: "Apartamento" }, { id: 202, nombre: "Casa con patio" }] },
  { id: 3, nombre: "Sociable con Niños", tipo: "booleano", peso: 1.0, filtro_absoluto: true, activo: true, opciones: [] },
  { id: 4, nombre: "Edad Aproximada", tipo: "numerico", peso: 0.5, filtro_absoluto: false, activo: false, opciones: [] },
  { id: 5, nombre: "Necesita Medicación", tipo: "booleano", peso: 0.7, filtro_absoluto: false, activo: true, opciones: [] },
];

export function TagManagementView() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", tipo: "", estado: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const { data: realTags, isLoading, error } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: getTags,
    enabled: !isDemo,
  });

  const tags = isDemo ? MOCK_TAGS : realTags;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const deactivateMutation = useMutation({
    mutationFn: (id) => isDemo ? Promise.resolve() : deleteTag(id),
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      showToast("Etiqueta desactivada correctamente.");
    },
    onError: (err) => {
      showToast(err.response?.data?.message || "Error al desactivar la etiqueta.", "error");
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: "", tipo: "", estado: "" });
  };

  const handleCreate = () => {
    setSelectedTag(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleDeactivate = (tag) => {
    if (confirm(`¿Estás seguro de que deseas desactivar la etiqueta "${tag.nombre}"?`)) {
      deactivateMutation.mutate(tag.id || tag.id_etiqueta);
    }
  };

  const filteredTags = (tags || []).filter((tag) => {
    const matchesSearch = tag.nombre.toLowerCase().includes(filters.search.toLowerCase());
    const matchesTipo = filters.tipo === "" || tag.tipo === filters.tipo;
    const matchesEstado = filters.estado === "" || (filters.estado === "activo" ? tag.activo : !tag.activo);
    return matchesSearch && matchesTipo && matchesEstado;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-[#8b9e7e] mb-1">
            <TagIcon size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Configuración Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-serif italic">Gestión de Tags</h1>
          <p className="text-gray-500 text-sm">Administra el catálogo de etiquetas y ponderaciones para el algoritmo de matching.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#8b9e7e]/20 transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            Nuevo Tag
          </button>
        </div>
      </div>

      <TagFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={handleResetFilters} 
      />

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex flex-col items-center gap-3 text-center">
          <p className="text-rose-900 font-bold">Ocurrió un error al cargar las etiquetas.</p>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-tags"] })}
            className="text-rose-600 text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="relative">
        <TagTable 
          tags={filteredTags} 
          loading={isLoading} 
          onEdit={handleEdit} 
          onDeactivate={handleDeactivate} 
        />
        
        {deactivateMutation.isPending && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-3xl z-10">
            <Loader2 className="animate-spin text-[#8b9e7e]" size={32} />
          </div>
        )}
      </div>

      <TagModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tag={selectedTag}
        onSuccess={(msg) => showToast(msg)}
        onError={(msg) => showToast(msg, "error")}
        isDemo={isDemo}
      />

      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
