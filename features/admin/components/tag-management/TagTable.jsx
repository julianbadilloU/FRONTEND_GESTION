"use client";

import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TIPO_LABELS = {
  categorico: "Categórico",
  numerico: "Numérico",
  booleano: "Booleano",
};

export function TagTable({ tags, onEdit, onDeactivate, loading }) {
  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-medium font-serif italic text-lg">No se encontraron etiquetas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Nombre</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Tipo</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Peso</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Estado</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890] text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tags.map((tag) => (
            <tr key={tag.id || tag.id_etiqueta} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-gray-900">{tag.nombre}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                  {TIPO_LABELS[tag.tipo] || tag.tipo}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#8b9e7e] transition-all" 
                      style={{ width: `${(tag.peso || 0.5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{tag.peso}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tighter",
                  tag.activo ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {tag.activo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {tag.activo ? "Activo" : "Inactivo"}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(tag)}
                    className="p-2 text-gray-400 hover:text-[#8b9e7e] transition-colors hover:bg-[#8b9e7e]/10 rounded-lg"
                    title="Editar etiqueta"
                  >
                    <Edit size={18} />
                  </button>
                  {tag.activo && (
                    <button 
                      onClick={() => onDeactivate(tag)}
                      className="p-2 text-gray-400 hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-lg"
                      title="Desactivar etiqueta"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
