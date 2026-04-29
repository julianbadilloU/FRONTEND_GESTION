"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { mascotaDatosBasicosSchema } from "@/features/albergue/schemas/mascota.schemas";
import { StepTags } from "@/features/albergue/components/publicar-mascota/StepTags";
import { PhotoGallery } from "@/features/albergue/components/publicar-mascota/PhotoGallery";
import {
  getMascotaById,
  updateMascota,
} from "@/features/albergue/services/mascota.service";
import { cn } from "@/lib/utils/cn";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-white border border-[#a9c99a] rounded-2xl px-5 py-4 shadow-2xl"
    >
      <span className="w-7 h-7 rounded-full bg-[#5e924e] flex items-center justify-center shrink-0 shadow">
        <Check size={13} color="white" strokeWidth={3} />
      </span>
      <p className="text-sm font-medium text-gray-800">{message}</p>
    </motion.div>
  );
}

// ─── FieldInput reutilizable ─────────────────────────────────────────────────
function FieldInput({ id, error, className = "", ...props }) {
  return (
    <input
      id={id}
      className={cn(
        "w-full border rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#81af6d]/50",
        error
          ? "border-red-300 bg-white"
          : "border-[#d8cfc5] bg-white hover:border-[#a9c99a]",
        className,
      )}
      {...props}
    />
  );
}

// ─── Componente principal (HU-MA-02) ─────────────────────────────────────────
export function EditarMascotaForm() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [tags, setTags] = useState({});
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [toast, setToast] = useState(null);

  // Cargar datos de la mascota
  const {
    data: mascota,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mascota", id],
    queryFn: () => getMascotaById(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateMascota(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascota", id] });
      queryClient.invalidateQueries({ queryKey: ["mascotas"] });
      showToast("Mascota actualizada exitosamente");
      setTimeout(() => router.push("/albergue/mascotas"), 1500);
    },
    onError: () => {
      showToast("Error al actualizar la mascota");
    },
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mascotaDatosBasicosSchema),
    mode: "onChange",
  });

  // Inicializar formulario cuando se cargan los datos
  useEffect(() => {
    if (!mascota) return;

    reset({
      nombre: mascota.nombre || "",
      descripcion: mascota.descripcion || "",
    });

    // Inicializar tags desde la mascota
    setTags({
      animalType: mascota.tipo_animal || "",
      breed: mascota.raza || "",
      age: mascota.edad || "",
      size: mascota.tamano || "",
      color: mascota.color || "",
      sex: mascota.sexo || "",
      energy: mascota.energia || "",
      compatibility: mascota.compatibilidad || [],
      specialCondition: mascota.condicion_especial || "",
      healthStatus: mascota.estado_salud || [],
    });

    // Fotos existentes (desde URLs del servidor)
    if (mascota.fotos && Array.isArray(mascota.fotos)) {
      const existing = mascota.fotos.map((url, i) => ({
        id: `existing-${i}`,
        url,
        preview: url,
        isExisting: true,
      }));
      setExistingPhotos(existing);
      setPhotos(existing);
    }
  }, [mascota, reset]);

  const handleTagChange = useCallback((key, value) => {
    setTags((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePhotosChange = useCallback((newPhotos) => {
    setPhotos(newPhotos);
  }, []);

  const onSubmit = (data) => {
    const newFotos = photos
      .filter((p) => !p.isExisting)
      .map((p) => p.file);

    const keepFotos = photos
      .filter((p) => p.isExisting)
      .map((p) => p.url);

    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      ...tags,
      fotos: newFotos,
      fotos_existentes: keepFotos,
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <Loader2 className="animate-spin text-[#81af6d] mb-4" size={32} />
        <p>Cargando datos de la mascota...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-500">
        <p>Error al cargar la mascota. Verifica que el ID sea correcto.</p>
        <Link
          href="/albergue/mascotas"
          className="mt-4 text-sm text-[#81af6d] hover:underline"
        >
          Volver a mascotas
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/albergue/mascotas"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Mascota
            </h1>
            <p className="text-sm text-gray-500">
              {mascota?.nombre || "Cargando..."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-8">
            {/* Datos básicos */}
            <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Datos Básicos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="m-nombre"
                    className="block text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400 mb-1"
                  >
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <FieldInput
                    id="m-nombre"
                    type="text"
                    error={errors.nombre}
                    {...register("nombre")}
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                {/* Descripción - full width */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="m-desc"
                    className="block text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400 mb-1"
                  >
                    Descripción{" "}
                    <span className="normal-case font-normal tracking-normal text-gray-300">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    id="m-desc"
                    rows={4}
                    className={cn(
                      "w-full border rounded-lg px-3 py-2 text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#81af6d]/50",
                      errors.descripcion
                        ? "border-red-300 bg-white"
                        : "border-[#d8cfc5] bg-white hover:border-[#a9c99a]",
                    )}
                    {...register("descripcion")}
                  />
                  {errors.descripcion && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.descripcion.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fotos */}
            <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Fotos</h2>
              <PhotoGallery
                photos={photos}
                onPhotosChange={handlePhotosChange}
              />
            </div>

            {/* Tags */}
            <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Características
              </h2>
              <StepTags tags={tags} onTagChange={handleTagChange} />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-8">
            <Link
              href="/albergue/mascotas"
              className="px-6 py-2.5 rounded-full border border-[#c8b9a6] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-full bg-[#81af6d] hover:bg-[#5e924e] text-white text-sm font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Guardando…
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast} />}
      </AnimatePresence>
    </>
  );
}
