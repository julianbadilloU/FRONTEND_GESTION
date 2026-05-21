"use client";

import { Lock, MapPin, Download, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { exportarDatos, eliminarCuenta } from "@/lib/auth/cuenta.service";
import { clearSessionTokens } from "@/lib/auth/token-storage";

function Field({ label, value, locked = false, icon = null, colSpan = 1 }) {
  return (
    <div className={colSpan === 2 ? "col-span-2" : "col-span-1"}>
      <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {label}
        {locked && (
          <>
            <Lock size={9} className="text-gray-300 shrink-0" />
            <span className="normal-case font-normal text-gray-300 tracking-normal">
              No editable
            </span>
          </>
        )}
      </p>

      <p className="text-sm text-gray-800 flex items-center gap-1.5">
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        {value || <span className="text-gray-300 italic">—</span>}
      </p>
    </div>
  );
}

function DeleteConfirmModal({ onConfirm, onCancel }) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmEnabled = confirmText === "ELIMINAR";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Eliminar cuenta</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
            Para confirmar, escribe <strong>ELIMINAR</strong> a continuación:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="Escribe ELIMINAR"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmEnabled}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isConfirmEnabled
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileView({ profile, logoSrc }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleExportarDatos = async () => {
    try {
      await exportarDatos();
    } catch (error) {
      console.error("Error al exportar datos:", error);
    }
  };

  const handleEliminarCuenta = async () => {
    try {
      await eliminarCuenta();
      clearSessionTokens();
      router.push("/login");
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
    }
  };

  return (
    <>
      <div className="bg-[#f0ece6] border border-[#e4d5c4] rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex flex-col items-center gap-3 sm:w-36 shrink-0">
            <div className="w-36 h-36 rounded-2xl overflow-hidden bg-[#e2d9cf] border border-[#d5c8ba]">
              <Image
                src={logoSrc || "/shelter-dogs.jpg"}
                alt={profile.name}
                width={144}
                height={144}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/shelter-dogs.jpg"; }}
              />
            </div>
            <span className="font-bold text-sm text-gray-800 text-center leading-snug">
              {profile.name}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            <Field label="Nombre del Albergue" value={profile.name} />
            <Field label="NIT" value={profile.nit} locked />
            <Field label="Correo Electrónico" value={profile.email} locked />
            <Field label="Número de WhatsApp" value={profile.whatsapp} />
            <Field label="Dirección" value={profile.address} />
            <Field label="Ciudad" value={profile.city} icon={<MapPin size={13} />} />
            <Field label="Sitio Web o Red Social" value={profile.website} colSpan={2} />
            <Field
              label="Descripción (opcional, máx. 500 caracteres)"
              value={profile.description}
              colSpan={2}
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#e4d5c4]">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-3">
            Zona peligrosa
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportarDatos}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <Download size={15} />
              Exportar mis datos
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Trash2 size={15} />
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={handleEliminarCuenta}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}