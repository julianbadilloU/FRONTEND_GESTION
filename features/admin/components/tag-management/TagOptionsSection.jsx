"use client";

import { useState } from "react";
import { Plus, X, Loader2, ListTree, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTagOption, deleteTagOption } from "@/features/admin/services/tag.service";

export function TagOptionsSection({ tag, isDemo }) {
  const queryClient = useQueryClient();
  const [newOption, setNewOption] = useState("");
  const [error, setError] = useState(null);

  const addMutation = useMutation({
    mutationFn: (nombre) =>
      isDemo
        ? Promise.resolve()
        : addTagOption(tag.id || tag.id_etiqueta, { nombre }),
    onSuccess: () => {
      setNewOption("");
      setError(null);
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Error al agregar la opción.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (idOpcion) =>
      isDemo
        ? Promise.resolve()
        : deleteTagOption(tag.id || tag.id_etiqueta, idOpcion),
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Error al eliminar la opción.");
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newOption.trim()) return;
    addMutation.mutate(newOption.trim());
  };

  const handleDelete = (idOpcion) => {
    deleteMutation.mutate(idOpcion);
  };

  const options = tag.opciones || [];

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
        <ListTree size={14} />
        Opciones del Tag
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => (
          <div
            key={opt.id || opt.id_opcion}
            className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all group"
          >
            <span className="text-sm font-semibold text-gray-700">{opt.nombre}</span>
            <button
              onClick={() => handleDelete(opt.id || opt.id_opcion)}
              disabled={deleteMutation.isPending}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-all p-1 rounded-lg hover:bg-rose-50"
              title="Eliminar opción"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {options.length === 0 && (
          <p className="col-span-full text-xs text-gray-400 italic py-2 text-center">Este tag aún no tiene opciones definidas.</p>
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mt-4">
        <input
          type="text"
          placeholder="Nombre de la opción..."
          className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-100 focus:border-[#8b9e7e] rounded-xl text-sm transition-all focus:outline-none"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          disabled={addMutation.isPending}
        />
        <button
          type="submit"
          disabled={!newOption.trim() || addMutation.isPending}
          className="bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white p-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {addMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        </button>
      </form>
      {error && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">{error}</p>}
    </div>
  );
}
