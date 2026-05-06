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
  getEtiquetas,
} from "@/features/albergue/services/mascota.service";
import {
  buildTagsIds,
  mapBackendTagsToSlugs,
} from "@/features/albergue/utils/mascota-tag-mapping";
import { compressAndEncodePhotos } from "@/features/albergue/utils/photo-utils";
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
  const [originalPhotos, setOriginalPhotos] = useState([]);
  const [toast, setToast] = useState(null);
  const [etiquetas, setEtiquetas] = useState([]);
  const [etiquetasError, setEtiquetasError] = useState(false);
  const [photosProgress, setPhotosProgress] = useState({ done: 0, total: 0 });

  // Cargar etiquetas del backend
  useEffect(() => {
    let cancelled = false;
    async function loadEtiquetas() {
      try {
        const response = await getEtiquetas();
        const list = response?.data || response || [];
        if (!cancelled) setEtiquetas(list);
      } catch {
        if (!cancelled) setEtiquetasError(true);
      }
    }
    loadEtiquetas();
    return () => { cancelled = true; };
  }, []);

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
      queryClient.invalidateQueries({ queryKey: ["mis-mascotas"] });
      showToast("Mascota actualizada exitosamente");
      setTimeout(() => router.push("/albergue/mascotas"), 1500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Error al actualizar la mascota";
      showToast(msg);
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

    // Inicializar tags desde la mascota (mapear de backend a slugs)
    if (etiquetas.length > 0 && mascota.tags) {
      const mappedTags = mapBackendTagsToSlugs(mascota.tags, etiquetas);
      setTags(mappedTags);
    }

    // Fotos existentes (con id_foto para tracking)
    if (mascota.fotos && Array.isArray(mascota.fotos)) {
      const existing = mascota.fotos.map((foto, i) => ({
        id: `existing-${foto.id_foto}`,
        id_foto: foto.id_foto,
        url: foto.url_foto,
        preview: foto.url_foto,
        isExisting: true,
        orden: foto.orden ?? i,
      }));
      setOriginalPhotos(existing);
      setPhotos(existing);
    }
  }, [mascota, etiquetas, reset]);

  const handleTagChange = useCallback((key, value) => {
    setTags((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePhotosChange = useCallback((newPhotos) => {
    setPhotos(newPhotos);
  }, []);

  const onSubmit = async (data) => {
    // 1. Calcular tagsIds
    const tagsIds = buildTagsIds(tags, etiquetas);

    // 2. Detectar fotos eliminadas
    const currentExistingIds = new Set(
      photos.filter((p) => p.isExisting).map((p) => p.id_foto)
    );
    const fotosEliminadas = originalPhotos
      .filter((p) => !currentExistingIds.has(p.id_foto))
      .map((p) => p.id_foto);

    // 3. Procesar fotos nuevas (base64) y existentes (reordenamiento)
    const nuevasFotos = photos.filter((p) => !p.isExisting);
    const fotosExistentes = photos.filter((p) => p.isExisting);

    let fotosPayload = [];

    // Fotos existentes que quedan (para reordenar)
    for (let i = 0; i < fotosExistentes.length; i++) {
      fotosPayload.push({
        id_foto: fotosExistentes[i].id_foto,
        orden: i,
      });
    }

    // Fotos nuevas: comprimir y convertir a base64
    if (nuevasFotos.length > 0) {
      try {
        const base64Photos = await compressAndEncodePhotos(
          nuevasFotos.map((p) => p.file),
          (done, total) => setPhotosProgress({ done, total })
        );
        for (let i = 0; i < base64Photos.length; i++) {
          fotosPayload.push({
            base64: base64Photos[i],
            orden: fotosExistentes.length + i,
          });
        }
      } catch {
        showToast("Error al procesar las fotos. Intenta con imágenes más pequeñas.");
        return;
      }
    }

    // 4. Validar que hay al menos 1 foto
    const totalFotos = fotosExistentes.length + nuevasFotos.length;
    if (totalFotos < 1) {
      showToast("La mascota debe tener al menos una foto.");
      return;
    }

    // 5. Construir payload
    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion || undefined,
      tagsIds,
      fotos: fotosPayload,
      fotos_eliminadas: fotosEliminadas,
      updated_at: mascota?.updated_at,
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

        {etiquetasError && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-700 text-sm rounded-xl text-center border border-amber-200">
            No se pudo cargar el catálogo de etiquetas. Algunas opciones pueden no estar disponibles.
          </div>
        )}

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
                    className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1"
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
                    className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1"
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
              {updateMutation.isPending && photosProgress.total > 0 && (
                <div className="mt-2 text-center text-sm text-gray-600">
                  Procesando fotos: {photosProgress.done} de {photosProgress.total}…
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Características
              </h2>
              <StepTags tags={tags} onTagChange={handleTagChange} etiquetas={etiquetas} />
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
              disabled={updateMutation.isPending || etiquetas.length === 0}
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
