"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, Tag as TagIcon, Scale, ShieldCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tagSchema } from "@/features/admin/schemas/tag.schemas";
import { createTag, updateTag } from "@/features/admin/services/tag.service";
import { TagOptionsSection } from "./TagOptionsSection";
import { cn } from "@/lib/utils/cn";

export function TagModal({ isOpen, onClose, tag, onSuccess, onError, isDemo }) {
  const queryClient = useQueryClient();
  const isEditing = !!tag;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      nombre: "",
      tipo: "categorico",
      peso: 0.5,
      filtro_absoluto: false,
      activo: true,
    },
  });

  useEffect(() => {
    if (tag) {
      reset({
        nombre: tag.nombre,
        tipo: tag.tipo,
        peso: tag.peso,
        filtro_absoluto: tag.filtro_absoluto,
        activo: tag.activo,
      });
    } else {
      reset({
        nombre: "",
        tipo: "categorico",
        peso: 0.5,
        filtro_absoluto: false,
        activo: true,
      });
    }
  }, [tag, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: (data) => 
      isDemo 
        ? Promise.resolve() 
        : (isEditing ? updateTag(tag.id || tag.id_etiqueta, data) : createTag(data)),
    onSuccess: () => {
      if (!isDemo) queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      onSuccess?.(isEditing ? "Etiqueta actualizada correctamente." : "Etiqueta creada correctamente.");
      onClose();
    },
    onError: (err) => {
      onError?.(err.response?.data?.message || "Ocurrió un error al guardar la etiqueta.");
    }
  });



  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const currentPeso = watch("peso");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#8b9e7e]/10 text-[#8b9e7e] rounded-2xl flex items-center justify-center shadow-inner">
                <TagIcon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-serif italic">
                  {isEditing ? "Editar Tag" : "Nuevo Tag"}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configuración del catálogo</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <form id="tag-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Nombre del Tag</label>
                <input 
                  id="nombre"
                  {...register("nombre")}
                  className={cn(
                    "w-full px-5 py-3.5 bg-gray-50 border-2 rounded-2xl text-sm transition-all focus:outline-none",
                    errors.nombre ? "border-rose-100 bg-rose-50 text-rose-900" : "border-transparent focus:bg-white focus:border-[#8b9e7e]"
                  )}
                  placeholder="Ej: Nivel de energía"
                />
                {errors.nombre && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">{errors.nombre.message}</p>}
              </div>

              {/* Tipo (Disabled on Edit) */}
              <div className="space-y-2">
                <label htmlFor="tipo" className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Tipo de dato</label>
                <select 
                  id="tipo"
                  {...register("tipo")}
                  disabled={isEditing}
                  className={cn(
                    "w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-sm outline-none cursor-pointer transition-all focus:bg-white focus:border-[#8b9e7e]",
                    isEditing && "opacity-50 cursor-not-allowed bg-gray-100"
                  )}
                >
                  <option value="categorico">Categórico</option>
                  <option value="numerico">Numérico</option>
                  <option value="booleano">Booleano</option>
                </select>
                {isEditing && <p className="text-[9px] text-gray-400 font-semibold italic">El tipo no se puede cambiar una vez creado el tag.</p>}
              </div>

              {/* Peso Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="peso" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
                    <Scale size={14} />
                    Peso (Importancia)
                  </label>
                  <span className="text-sm font-bold text-[#8b9e7e] bg-[#8b9e7e]/10 px-3 py-1 rounded-lg">{(currentPeso || 0.5).toFixed(1)}</span>
                </div>
                <input 
                  id="peso"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  {...register("peso", { valueAsNumber: true })}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8b9e7e]"
                />

                <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                  <span>Irrelevante</span>
                  <span>Promedio</span>
                  <span>Crítico</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-gray-50 rounded-2xl group hover:bg-gray-100/50 transition-colors">
                  <label htmlFor="filtro_absoluto" className="flex items-center gap-3 cursor-pointer">
                    <input 
                      id="filtro_absoluto"
                      type="checkbox"
                      {...register("filtro_absoluto")}
                      className="w-5 h-5 rounded-lg border-gray-200 text-[#8b9e7e] focus:ring-[#8b9e7e]"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-[#8b9e7e]" />
                        Filtro Absoluto
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium">Requisito excluyente</span>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl group hover:bg-gray-100/50 transition-colors">
                  <label htmlFor="activo" className="flex items-center gap-3 cursor-pointer">
                    <input 
                      id="activo"
                      type="checkbox"
                      {...register("activo")}
                      className="w-5 h-5 rounded-lg border-gray-200 text-[#8b9e7e] focus:ring-[#8b9e7e]"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">Estado Activo</span>
                      <span className="text-[9px] text-gray-400 font-medium">Visible en formularios</span>
                    </div>
                  </label>
                </div>
              </div>

            </form>

            {/* Options Management (Only on Edit) */}
            {isEditing && <TagOptionsSection tag={tag} isDemo={isDemo} />}

          </div>

          {/* Footer */}
          <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
            <button 
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 px-6 py-3.5 rounded-2xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-white hover:text-gray-900 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              form="tag-form"
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-[#8b9e7e] hover:bg-[#7a8e6e] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#8b9e7e]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEditing ? "Guardar Cambios" : "Crear Tag"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
