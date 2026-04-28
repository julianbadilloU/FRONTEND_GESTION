"use client";

import { Search, Filter, X } from "lucide-react";

export function TagFilters({ filters, onFilterChange, onReset }) {
  const hasActiveFilters = filters.tipo !== "" || filters.estado !== "" || filters.search !== "";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar etiquetas..."
          className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-[#8b9e7e] border-2 rounded-2xl text-sm transition-all focus:outline-none"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">
          <Filter size={14} />
          Filtrar:
        </div>
        
        <select 
          className="bg-gray-50 border-2 border-transparent focus:border-[#8b9e7e] px-4 py-2 rounded-xl text-xs font-bold text-gray-700 outline-none transition-all cursor-pointer"
          value={filters.tipo}
          onChange={(e) => onFilterChange("tipo", e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="categorico">Categórico</option>
          <option value="numerico">Numérico</option>
          <option value="booleano">Booleano</option>
        </select>

        <select 
          className="bg-gray-50 border-2 border-transparent focus:border-[#8b9e7e] px-4 py-2 rounded-xl text-xs font-bold text-gray-700 outline-none transition-all cursor-pointer"
          value={filters.estado}
          onChange={(e) => onFilterChange("estado", e.target.value)}
        >
          <option value="">Cualquier estado</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>

        {hasActiveFilters && (
          <button 
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Limpiar filtros"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
