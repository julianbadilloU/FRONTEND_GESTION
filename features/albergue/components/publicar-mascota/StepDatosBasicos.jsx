"use client";

import { cn } from "@/lib/utils/cn";
import { PhotoUploader } from "./PhotoUploader";

export function StepDatosBasicos({ register, errors, photos, onPhotosChange }) {
  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      {/* Nombre */}
      <div className="space-y-1 relative">
        <label className="text-sm font-semibold text-gray-700">
          Nombre de la mascota <span className="text-red-400">*</span>
        </label>
        <input
          {...register("nombre")}
          className={cn(
            "w-full border-2 rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800 bg-white",
            errors.nombre
              ? "border-red-300 focus:border-red-500"
              : "border-gray-100 focus:border-[#81af6d]"
          )}
          placeholder="Ej: Luna, Max, Firulais"
        />
        {errors.nombre && (
          <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-1 relative">
        <label className="text-sm font-semibold text-gray-700">
          Descripción{" "}
          <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          {...register("descripcion")}
          rows={4}
          className={cn(
            "w-full border-2 rounded-xl py-3 px-4 focus:outline-none transition-colors text-sm text-gray-800 resize-none bg-white",
            errors.descripcion
              ? "border-red-300 focus:border-red-500"
              : "border-gray-100 focus:border-[#81af6d]"
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
