"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, Mail, Shield, Calendar, Globe, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsuarioById } from "@/features/admin/services/adminUser.service";
import { cn } from "@/lib/utils/cn";

const ESTADO_COLORS = {
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspendido: "bg-rose-50 text-rose-700 border-rose-200",
  perfil_incompleto: "bg-amber-50 text-amber-700 border-amber-200",
};

const ROLE_COLORS = {
  adoptante: "bg-blue-50 text-blue-700",
  albergue: "bg-[#e8f0e4] text-[#4a7c59]",
  administrador: "bg-purple-50 text-purple-700",
};

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">{title}</p>
      {children}
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        <Icon size={13} />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 truncate">{value ?? "—"}</p>
    </div>
  );
}

function PerfilAdoptante({ perfil }) {
  if (!perfil) return <p className="text-sm text-gray-400 italic text-center py-6">Sin datos de perfil adicionales.</p>;
  return (
    <Section title="Perfil de adoptante">
      <div className="grid grid-cols-2 gap-3">
        <InfoChip icon={User} label="Nombre" value={perfil.nombre_completo} />
        <InfoChip icon={Hash} label="WhatsApp" value={perfil.whatsapp} />
        <InfoChip icon={Globe} label="Departamento" value={perfil.departamento} />
        <InfoChip icon={Globe} label="Ciudad" value={perfil.ciudad} />
      </div>
      {perfil.direccion && (
        <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Dirección</span>
          <p className="text-sm text-gray-700 mt-0.5">{perfil.direccion}</p>
        </div>
      )}
      {perfil.foto_perfil && (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">Foto de perfil</p>
          <img src={perfil.foto_perfil} alt="Perfil" className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 shadow-sm" />
        </div>
      )}
    </Section>
  );
}

function PerfilAlbergue({ perfil }) {
  if (!perfil) return <p className="text-sm text-gray-400 italic text-center py-6">Sin datos de perfil adicionales.</p>;
  return (
    <Section title="Perfil de albergue">
      <div className="grid grid-cols-2 gap-3">
        <InfoChip icon={User} label="Nombre" value={perfil.nombre} />
        <InfoChip icon={Hash} label="NIT" value={perfil.nit} />
        <InfoChip icon={Hash} label="WhatsApp" value={perfil.whatsapp} />
        <InfoChip icon={Globe} label="Sitio web" value={perfil.sitio_web} />
        <InfoChip icon={Globe} label="Departamento" value={perfil.departamento} />
        <InfoChip icon={Globe} label="Ciudad" value={perfil.ciudad} />
      </div>
      {perfil.direccion && (
        <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Dirección</span>
          <p className="text-sm text-gray-700 mt-0.5">{perfil.direccion}</p>
        </div>
      )}
      {perfil.descripcion && (
        <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Descripción</span>
          <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{perfil.descripcion}</p>
        </div>
      )}
      {perfil.logo && (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">Logo</p>
          <img src={perfil.logo} alt="Logo" className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 shadow-sm" />
        </div>
      )}
    </Section>
  );
}

export function UserDetailModal({ isOpen, onClose, userId }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError(null);
      getUsuarioById(userId)
        .then((data) => { setUserData(data); setLoading(false); })
        .catch((err) => { setError(err.response?.data?.message || err.message || "Error al cargar usuario"); setLoading(false); });
    }
  }, [isOpen, userId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b9e7e]/10 flex items-center justify-center shrink-0">
                  <User size={20} className="text-[#8b9e7e]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Detalle del Usuario</h2>
                  {userData && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", ROLE_COLORS[userData.rol] ?? "bg-gray-100 text-gray-500")}>
                        {userData.rol}
                      </span>
                      {userData.estado && (
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", ESTADO_COLORS[userData.estado] ?? "bg-gray-100 text-gray-500 border-gray-200")}>
                          {userData.estado?.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-[#8b9e7e]" size={28} />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-rose-600 font-semibold">{error}</p>
                </div>
              ) : userData ? (
                <div className="space-y-6">
                  {/* Info general */}
                  <Section title="Información general">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoChip icon={Hash} label="ID" value={`#${userData.id}`} />
                      <InfoChip icon={Mail} label="Correo" value={userData.correo} />
                      <InfoChip icon={Calendar} label="Registro" value={formatDate(userData.fecha_registro)} />
                      {userData.ip_registro && <InfoChip icon={Globe} label="IP" value={userData.ip_registro} />}
                    </div>
                  </Section>

                  {/* Perfil */}
                  {userData.perfil?.tipo === "adoptante" ? (
                    <PerfilAdoptante perfil={userData.perfil} />
                  ) : userData.perfil?.tipo === "albergue" ? (
                    <PerfilAlbergue perfil={userData.perfil} />
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                      <User size={28} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 font-medium">
                        {userData.rol === "administrador" ? "Administrador — sin datos de perfil." : "Este usuario no tiene datos de perfil adicionales."}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4 flex justify-end shrink-0">
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
