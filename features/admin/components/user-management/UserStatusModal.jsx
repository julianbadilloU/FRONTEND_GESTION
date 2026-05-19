"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, UserCog } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cambiarEstadoUsuario } from "@/features/admin/services/adminUser.service";

export function UserStatusModal({ isOpen, onClose, user, action, onSuccess, onError }) {
  const queryClient = useQueryClient();
  const [motivo, setMotivo] = useState("");

  const isActivar = action === "activar";
  const estadoDestino = isActivar ? "activo" : "suspendido";

  const mutation = useMutation({
    mutationFn: () =>
      cambiarEstadoUsuario(user.id, { estado: estadoDestino, motivo: motivo.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onSuccess?.(`Usuario ${isActivar ? "activado" : "suspendido"} correctamente.`);
      setMotivo("");
      onClose();
    },
    onError: (err) => {
      onError?.(err.response?.data?.message || "Ocurrió un error al cambiar el estado del usuario.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isActivar && !motivo.trim()) return;
    mutation.mutate();
  };

  const handleClose = () => {
    setMotivo("");
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative bg-white rounded-[2rem] shadow-2xl shadow-black/10 w-full max-w-md overflow-hidden border border-gray-100/60"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 flex items-center justify-between bg-gradient-to-br from-[#f8faf7] to-white border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#8b9e7e]/20 to-[#8b9e7e]/5 text-[#6d8060] rounded-xl flex items-center justify-center ring-1 ring-[#8b9e7e]/20">
                <UserCog size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[1.2rem] font-bold text-gray-900 font-serif italic leading-tight">
                  {isActivar ? "Activar usuario" : "Suspender usuario"}
                </h2>
                <p className="text-[9px] text-[#8b9e7e] font-bold uppercase tracking-[0.2em] mt-0.5">
                  Gestión de acceso
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-150"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            <div className="space-y-1">
              <p className="text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-gray-400">Usuario</p>
              <p className="text-sm font-semibold text-gray-800">{user.correo}</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="motivo"
                className="text-[9.5px] font-extrabold uppercase tracking-[0.15em] text-gray-400"
              >
                Motivo {isActivar ? "(opcional)" : "(requerido)"}
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required={!isActivar}
                rows={3}
                placeholder={
                  isActivar
                    ? "Ej: Resolución de disputa"
                    : "Ej: Incumplimiento de términos de uso"
                }
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 transition-all duration-200 focus:outline-none focus:bg-white focus:border-[#8b9e7e] focus:ring-2 focus:ring-[#8b9e7e]/15 placeholder:text-gray-300 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={mutation.isPending}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all duration-150 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isPending || (!isActivar && !motivo.trim())}
                className="flex-1 bg-[#8b9e7e] hover:bg-[#7d9070] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#8b9e7e]/25 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {isActivar ? "Activar" : "Suspender"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
