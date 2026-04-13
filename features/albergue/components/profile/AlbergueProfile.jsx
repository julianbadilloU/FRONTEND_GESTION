"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ProfileView } from "./ProfileView";
import { ProfileForm } from "./ProfileForm";
import { getAlbergueProfile, updateAlbergueProfile } from "../../services/albergue.service";

// ─── Datos mock (reemplazar por fetch real cuando exista el endpoint) ─────────
const MOCK_PROFILE = {
  name:        "Fundación Huellitas",
  nit:         "9001234567",
  email:       "contacto@huellitas.org",
  whatsapp:    "3124567890",
  address:     "Calle 10 #5-32, Barrio Centro",
  city:        "Neiva, Huila",
  website:     "https://www.huellitas.org",
  description: "Somos una fundación dedicada al rescate y cuidado de animales en situación de calle en Neiva, Huila.",
  logoUrl:     "/shelter-dogs.jpg",
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{    opacity: 0, y: 16, scale: 0.97  }}
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

// ─── Controlador principal ────────────────────────────────────────────────────
export function AlbergueProfile() {
  const queryClient = useQueryClient();
  const [isEditing,   setIsEditing]   = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64,  setLogoBase64]  = useState(null);
  const [toast,       setToast]       = useState(null);

  const { data: serverProfile, isLoading, isError } = useQuery({
    queryKey: ["albergueProfile"],
    queryFn: getAlbergueProfile,
  });

  const profile = serverProfile ? {
     name: serverProfile.nombre_albergue || "",
     nit: serverProfile.nit || "",
     email: serverProfile.correo || "",
     whatsapp: serverProfile.whatsapp_actual || "",
     website: serverProfile.sitio_web || "",
     description: serverProfile.descripcion || "",
     logoUrl: serverProfile.logo || "",
     address: "", // Opcional, si existiera
     city: "",
  } : MOCK_PROFILE;

  const updateMutation = useMutation({
    mutationFn: updateAlbergueProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albergueProfile"] });
      showToast("Perfil actualizado exitosamente");
      setIsEditing(false);
      setLogoPreview(null);
      setLogoBase64(null);
    },
    onError: (err) => {
       if (err?.response?.status === 400) {
           showToast("Error de validación en los campos enviados");
       } else {
           showToast("Error al actualizar el perfil");
       }
    }
  });

  // ── Mostrar toast 3.5 s ──────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Cambio de logo con preview y base64 ──────────────────────────────────
  const handleLogoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Guardar cambios ──────────────────────────────────────────────────────
  const handleSave = useCallback((data) => {
    const payload = {
      descripcion: data.description,
      whatsapp_actual: data.whatsapp,
      sitio_web: data.website,
    };
    if (logoBase64) {
      payload.logo = logoBase64;
    }
    updateMutation.mutate(payload);
  }, [logoBase64, updateMutation]);

  // ── Cancelar edición ─────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    setLogoPreview(null);
    setLogoBase64(null);
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
         <p>Ocurrió un error al cargar el perfil. Por favor, intenta más tarde.</p>
       </div>
     );
  }

  return (
    <>
      <div className="px-6 py-8 max-w-5xl mx-auto w-full">

        {/* Encabezado de sección */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Perfil del Albergue</h1>
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
            logoPreview={logoPreview}
            onLogoChange={handleLogoChange}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={updateMutation.isPending}
          />
        ) : (
          <ProfileView
            profile={profile}
            logoSrc={profile.logoUrl}
          />
        )}
      </div>

      {/* Toast de confirmación */}
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast} />}
      </AnimatePresence>
    </>
  );
}
