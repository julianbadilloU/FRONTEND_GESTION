"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, Shield, MapPin, Globe, Phone } from "lucide-react";
import { getUsuarioById } from "@/features/admin/services/adminUser.service";
import { cn } from "@/lib/utils/cn";

const ESTADO_COLORS = {
  activo: "bg-emerald-50 text-emerald-600",
  suspendido: "bg-rose-50 text-rose-600",
  perfil_incompleto: "bg-amber-50 text-amber-600",
};

const TABS = [
  { key: "general", label: "General" },
  { key: "perfil", label: "Perfil" },
];

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-gray-900 text-right max-w-[60%] break-words">
        {value ?? "—"}
      </span>
    </div>
  );
}

function PerfilAdoptante({ perfil }) {
  if (!perfil) return null;
  return (
    <div className="space-y-1">
      <InfoRow label="Nombre completo" value={perfil.nombre_completo} />
      <InfoRow label="WhatsApp" value={perfil.whatsapp} />
      <InfoRow label="Departamento" value={perfil.departamento} />
      <InfoRow label="Ciudad" value={perfil.ciudad} />
      <InfoRow label="Dirección" value={perfil.direccion} />
      {perfil.foto_perfil && (
        <div className="pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Foto de perfil
          </p>
          <img
            src={perfil.foto_perfil}
            alt="Foto de perfil"
            className="w-20 h-20 object-cover rounded-xl border border-gray-100"
          />
        </div>
      )}
    </div>
  );
}

function PerfilAlbergue({ perfil }) {
  if (!perfil) return null;
  return (
    <div className="space-y-1">
      <InfoRow label="Nombre albergue" value={perfil.nombre} />
      <InfoRow label="NIT" value={perfil.nit} />
      <InfoRow label="WhatsApp" value={perfil.whatsapp} />
      <InfoRow label="Sitio web" value={perfil.sitio_web} />
      <InfoRow label="Departamento" value={perfil.departamento} />
      <InfoRow label="Ciudad" value={perfil.ciudad} />
      <InfoRow label="Dirección" value={perfil.direccion} />
      {perfil.descripcion && (
        <div className="pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Descripción
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {perfil.descripcion}
          </p>
        </div>
      )}
      {perfil.logo && (
        <div className="pt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Logo
          </p>
          <img
            src={perfil.logo}
            alt="Logo del albergue"
            className="w-20 h-20 object-cover rounded-xl border border-gray-100"
          />
        </div>
      )}
    </div>
  );
}

export function UserDetailModal({ isOpen, onClose, userId }) {
  const [activeTab, setActiveTab] = useState("general");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError(null);
      setActiveTab("general");
      getUsuarioById(userId)
        .then((data) => {
          setUserData(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || err.message || "Error al cargar usuario");
          setLoading(false);
        });
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#8b9e7e]/10 rounded-full flex items-center justify-center">
              <User size={16} className="text-[#8b9e7e]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Detalle del Usuario
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#8b9e7e]" size={32} />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-rose-600 font-semibold">{error}</p>
            </div>
          ) : userData ? (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px",
                      activeTab === tab.key
                        ? "text-[#8b9e7e] border-[#8b9e7e]"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "general" && (
                  <div className="space-y-1">
                    <InfoRow label="ID" value={userData.id} />
                    <InfoRow label="Correo" value={userData.correo} />
                    <InfoRow label="Rol" value={userData.rol} />
                    <InfoRow
                      label="Estado"
                      value={
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase",
                            ESTADO_COLORS[userData.estado] ??
                              "bg-gray-100 text-gray-500"
                          )}
                        >
                          {userData.estado}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Fecha registro"
                      value={formatDate(userData.fecha_registro)}
                    />
                    {userData.ip_registro && (
                      <InfoRow label="IP registro" value={userData.ip_registro} />
                    )}
                    <InfoRow
                      label="Última actualización"
                      value={formatDate(userData.ultima_actualizacion)}
                    />
                  </div>
                )}

                {activeTab === "perfil" && (
                  <>
                    {!userData.perfil ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-400 font-medium">
                          Este usuario no tiene datos de perfil adicionales.
                        </p>
                      </div>
                    ) : userData.perfil.tipo === "adoptante" ? (
                      <PerfilAdoptante perfil={userData.perfil} />
                    ) : userData.perfil.tipo === "albergue" ? (
                      <PerfilAlbergue perfil={userData.perfil} />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-400 font-medium">
                          Perfil de administrador — sin datos adicionales.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
