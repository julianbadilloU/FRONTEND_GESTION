"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil } from "lucide-react";

import { ProfileView } from "./ProfileView";
import { ProfileForm } from "./ProfileForm";

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
  const [isEditing,   setIsEditing]   = useState(false);
  const [profile,     setProfile]     = useState(MOCK_PROFILE);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSaving,    setIsSaving]    = useState(false);
  const [toast,       setToast]       = useState(null);

  // ── Mostrar toast 3.5 s ──────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Cambio de logo con preview ───────────────────────────────────────────
  const handleLogoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
  }, []);

  // ── Guardar cambios (mock: simula 1 s de espera) ─────────────────────────
  const handleSave = useCallback(async (data) => {
    setIsSaving(true);
    // TODO: reemplazar por apiClient.patch('/api/albergue/perfil', { ...data, logo })
    await new Promise((res) => setTimeout(res, 1200));
    setProfile((prev) => ({
      ...prev,
      name:        data.name,
      whatsapp:    data.whatsapp,
      address:     data.address     ?? "",
      city:        data.city,
      website:     data.website     ?? "",
      description: data.description ?? "",
      ...(logoPreview ? { logoUrl: logoPreview } : {}),
    }));
    setIsSaving(false);
    setIsEditing(false);
    setLogoPreview(null);
    showToast("Cambios guardados correctamente");
  }, [logoPreview]);

  // ── Cancelar edición ─────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    setLogoPreview(null);
    setIsEditing(false);
  }, []);

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
            isSaving={isSaving}
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
