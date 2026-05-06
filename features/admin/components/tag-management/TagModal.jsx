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

  const filtroAbsoluto = watch("filtro_absoluto");
  const activo = watch("activo");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative bg-white rounded-[2rem] shadow-2xl shadow-black/10 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100/60"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 flex items-center justify-between bg-gradient-to-br from-[#f8faf7] to-white border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#8b9e7e]/20 to-[#8b9e7e]/5 text-[#6d8060] rounded-xl flex items-center justify-center ring-1 ring-[#8b9e7e]/20">
                <TagIcon size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[1.35rem] font-bold text-gray-900 font-serif italic leading-tight">
                  {isEditing ? "Editar Tag" : "Nuevo Tag"}
                </h2>
                <p className="text-[9px] text-[#8b9e7e] font-bold uppercase tracking-[0.2em] mt-0.5">Configuración del catálogo</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-150"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
            <form id="tag-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-gray-400">Nombre del Tag</label>
                <input 
                  id="nombre"
                  {...register("nombre")}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50/80 border rounded-xl text-sm font-medium text-gray-800 transition-all duration-200 focus:outline-none placeholder:text-gray-300",
                    errors.nombre
                      ? "border-rose-200 bg-rose-50/60 text-rose-800 focus:ring-2 focus:ring-rose-200"
                      : "border-gray-200 focus:bg-white focus:border-[#8b9e7e] focus:ring-2 focus:ring-[#8b9e7e]/15"
                  )}
                  placeholder="Ej: Nivel de energía"
                />
                {errors.nombre && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight">{errors.nombre.message}</p>}
              </div>

              {/* Tipo (Disabled on Edit) */}
              <div className="space-y-2">
                <label htmlFor="tipo" className="text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-gray-400">Tipo de dato</label>
                <div className="relative">
                  <select 
                    id="tipo"
                    {...register("tipo")}
                    disabled={isEditing}
                    className={cn(
                      "w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 outline-none cursor-pointer transition-all duration-200 appearance-none focus:bg-white focus:border-[#8b9e7e] focus:ring-2 focus:ring-[#8b9e7e]/15",
                      isEditing && "opacity-55 cursor-not-allowed bg-gray-100 text-gray-500"
                    )}
                  >
                    <option value="categorico">Categórico</option>
                    <option value="numerico">Numérico</option>
                    <option value="booleano">Booleano</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                {isEditing && (
                  <p className="text-[9px] text-amber-500/80 font-semibold italic flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    El tipo no se puede cambiar una vez creado el tag.
                  </p>
                )}
              </div>

              {/* Peso Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="peso" className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
                    <Scale size={12} />
                    Peso (Importancia)
                  </label>
                  <span className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums transition-colors duration-300",
                    currentPeso <= 0.3 ? "text-gray-500 bg-gray-100" :
                    currentPeso <= 0.6 ? "text-amber-600 bg-amber-50" :
                    "text-[#6d8060] bg-[#8b9e7e]/12"
                  )}>
                    {(currentPeso || 0.5).toFixed(1)}
                  </span>
                </div>

                {/* Track con gradiente semántico */}
                <div className="relative py-2">
                  <div className="absolute inset-y-0 flex items-center w-full px-0">
                    <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-gray-200 via-amber-200 to-[#8b9e7e]/60" />
                  </div>
                  <input 
                    id="peso"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    {...register("peso", { valueAsNumber: true })}
                    className="relative w-full h-1.5 rounded-full appearance-none cursor-pointer bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#8b9e7e] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-[#8b9e7e]/20 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#8b9e7e] [&::-moz-range-thumb]:shadow-md"
                  />
                </div>

                <div className="flex justify-between text-[8.5px] font-bold text-gray-300 uppercase tracking-widest">
                  <span>Irrelevante</span>
                  <span>Promedio</span>
                  <span>Crítico</span>
                </div>
              </div>

              {/* Toggle Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Filtro Absoluto */}
                <label
                  htmlFor="filtro_absoluto"
                  className={cn(
                    "relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none",
                    filtroAbsoluto
                      ? "border-[#8b9e7e]/40 bg-[#8b9e7e]/5"
                      : "border-gray-100 bg-gray-50/70 hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <input 
                    id="filtro_absoluto"
                    type="checkbox"
                    {...register("filtro_absoluto")}
                    className="sr-only"
                  />
                  {/* Custom toggle */}
                  <div className={cn(
                    "w-9 h-5 rounded-full flex-shrink-0 relative transition-colors duration-200",
                    filtroAbsoluto ? "bg-[#8b9e7e]" : "bg-gray-200"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                      filtroAbsoluto ? "left-[calc(100%-1.25rem)]" : "left-0.5"
                    )} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "text-xs font-bold flex items-center gap-1.5 transition-colors duration-200",
                      filtroAbsoluto ? "text-[#6d8060]" : "text-gray-600"
                    )}>
                      <ShieldCheck size={13} />
                      Filtro Absoluto
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium mt-0.5">Requisito excluyente</span>
                  </div>
                </label>

                {/* Estado Activo */}
                <label
                  htmlFor="activo"
                  className={cn(
                    "relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none",
                    activo
                      ? "border-[#8b9e7e]/40 bg-[#8b9e7e]/5"
                      : "border-gray-100 bg-gray-50/70 hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <input 
                    id="activo"
                    type="checkbox"
                    {...register("activo")}
                    className="sr-only"
                  />
                  {/* Custom toggle */}
                  <div className={cn(
                    "w-9 h-5 rounded-full flex-shrink-0 relative transition-colors duration-200",
                    activo ? "bg-[#8b9e7e]" : "bg-gray-200"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                      activo ? "left-[calc(100%-1.25rem)]" : "left-0.5"
                    )} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "text-xs font-bold transition-colors duration-200",
                      activo ? "text-[#6d8060]" : "text-gray-600"
                    )}>
                      Estado Activo
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium mt-0.5">Visible en formularios</span>
                  </div>
                </label>
              </div>

            </form>

            {/* Options Management (Only on Edit) */}
            {isEditing && <TagOptionsSection tag={tag} isDemo={isDemo} />}

          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100 flex gap-3">
            <button 
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all duration-150 disabled:opacity-40"
            >
              Cancelar
            </button>
            <button 
              form="tag-form"
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-[#8b9e7e] hover:bg-[#7d9070] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#8b9e7e]/25 hover:shadow-[#8b9e7e]/35 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEditing ? "Guardar Cambios" : "Crear Tag"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
