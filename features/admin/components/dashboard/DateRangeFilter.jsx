"use client";

import { CalendarDays, X } from "lucide-react";

export function DateRangeFilter({ desde, hasta, onChange }) {
  const handleDesdeChange = (e) => {
    onChange({ desde: e.target.value, hasta });
  };

  const handleHastaChange = (e) => {
    onChange({ desde, hasta: e.target.value });
  };

  const handleClear = () => {
    onChange({ desde: "", hasta: "" });
  };

  const hasFilter = desde || hasta;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
        <CalendarDays size={14} strokeWidth={2} />
        <span>Filtrar por fecha</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="date-desde">Desde</label>
        <input
          id="date-desde"
          type="date"
          value={desde}
          onChange={handleDesdeChange}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 focus:border-[#8b9e7e]"
        />
        <span className="text-xs text-gray-400">a</span>
        <label className="sr-only" htmlFor="date-hasta">Hasta</label>
        <input
          id="date-hasta"
          type="date"
          value={hasta}
          onChange={handleHastaChange}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 focus:border-[#8b9e7e]"
        />
      </div>

      {hasFilter && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Limpiar filtro de fecha"
        >
          <X size={12} strokeWidth={2.5} />
          Limpiar
        </button>
      )}
    </div>
  );
}
