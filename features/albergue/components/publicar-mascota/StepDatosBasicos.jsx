"use client";

import { cn } from "@/lib/utils/cn";
import { PhotoUploader } from "./PhotoUploader";

export function StepDatosBasicos({ register, errors, photos, onPhotosChange }) {
  return (
    <div className="space-y-7 w-full max-w-xl mx-auto">
      {/* Nombre */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-800">
          Nombre de la mascota <span className="text-red-400">*</span>
        </label>
        <input
          {...register("nombre")}
          className={cn(
            "w-full border rounded-xl py-3.5 px-4 focus:outline-none transition-all text-sm text-gray-800 bg-white placeholder:text-gray-400",
            errors.nombre
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-[#d5d0c8] focus:border-[#8b9e7e] focus:ring-2 focus:ring-[#8b9e7e]/10"
          )}
          placeholder="Ej: Luna, Max, Firulais"
        />
        {errors.nombre && (
          <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-800">
          Descripción{" "}
          <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          {...register("descripcion")}
          rows={4}
          className={cn(
            "w-full border rounded-xl py-3.5 px-4 focus:outline-none transition-all text-sm text-gray-800 resize-none bg-white placeholder:text-gray-400",
            errors.descripcion
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-[#d5d0c8] focus:border-[#8b9e7e] focus:ring-2 focus:ring-[#8b9e7e]/10"
          )}
          placeholder="Cuéntanos sobre la personalidad, historia o detalles especiales de esta mascota..."
        />
        {errors.descripcion && (
          <p className="text-xs text-red-500 mt-1">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      {/* Fotos */}
      <PhotoUploader photos={photos} onPhotosChange={onPhotosChange} />
    </div>
  );
}
