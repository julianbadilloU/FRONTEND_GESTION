"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ProfileView } from "./ProfileView";
import { ProfileForm } from "./ProfileForm";
import {
  getAdoptanteProfile,
  updateAdoptanteProfile,
} from "../../services/adoptante.service";
// Clave de matching — invalidar cache al cambiar preferencias (Sprint 4 HU-MT-01)
import { MATCH_QUERY_KEY } from "@/app/adoptante/feed/page";

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

// ─── Controlador principal (HU-US-02) ─────────────────────────────────────────
export function AdoptanteProfile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [toast, setToast] = useState(null);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["adoptanteProfile"],
    queryFn: getAdoptanteProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateAdoptanteProfile,
    onSuccess: (_, variables) => {
      // Siempre refrescar perfil
      queryClient.invalidateQueries({ queryKey: ["adoptanteProfile"] });

      // Si el payload incluye cambios de tags (preferencias), invalidar matching
      // para que el motor recalcule automáticamente al volver al feed
      if (variables?.tags !== undefined) {
        queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEY });
      }

      showToast("Perfil actualizado exitosamente");
      setIsEditing(false);
      setFotoPreview(null);
      setFotoBase64(null);
    },
    onError: () => {
      showToast("Error al actualizar el perfil");
    },
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleFotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = useCallback(
    (data) => {
      // Extraer solo IDs de los objetos de tags
      const tagIds = (data.tags || []).map((t) =>
        typeof t === "object" && t.id_opcion ? t.id_opcion : t,
      );
      const payload = {
        nombre_completo: data.nombre_completo,
        whatsapp: data.whatsapp,
        departamento: data.departamento || "",
        ciudad: data.ciudad,
        direccion: data.direccion || "",
        tags: tagIds,
      };
      if (fotoBase64) {
        payload.foto = fotoBase64;
      }
      updateMutation.mutate(payload);
    },
    [fotoBase64, updateMutation],
  );

  const handleCancel = useCallback(() => {
    setFotoPreview(null);
    setFotoBase64(null);
    setIsEditing(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <Loader2 className="animate-spin text-[#81af6d] mb-4" size={32} />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-500">
        <p>
          Ocurrió un error al cargar el perfil. Por favor, intenta más tarde.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-8 max-w-5xl mx-auto w-full">
        {/* Encabezado de sección */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2 bg-[#81af6d] hover:bg-[#5e924e] text-white rounded-full text-sm font-semibold transition-colors shadow-sm"
            >
              <Pencil size={14} />
              Editar
            </button>
          )}
        </div>

        {/* Vista o formulario */}
        {isEditing ? (
          <ProfileForm
            profile={profile}
            fotoPreview={fotoPreview}
            onFotoChange={handleFotoChange}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={updateMutation.isPending}
          />
        ) : (
          <ProfileView profile={profile} />
        )}
      </div>

      {/* Toast de confirmación */}
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast} />}
      </AnimatePresence>
    </>
  );
}
