"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, AlertTriangle, RefreshCw } from "lucide-react";
import { UserTable } from "./UserTable";
import { UserStatusModal } from "./UserStatusModal";
import { UserDetailModal } from "./UserDetailModal";
import { Toast } from "@/features/shared/components/Toast";
import { getUsuarios, cambiarEstadoUsuario } from "@/features/admin/services/adminUser.service";

export function UserManagementView() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ rol: "", estado: "" });
  const [modalState, setModalState] = useState({ open: false, user: null, action: null });
  const [detailUserId, setDetailUserId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => getUsuarios(filters),
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, estado, motivo }) => cambiarEstadoUsuario(id, { estado, motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const handleAction = (user, action) => {
    setModalState({ open: true, user, action });
  };

  const handleDetail = (userId) => {
    setDetailUserId(userId);
  };

  const handleModalClose = () => {
    setModalState({ open: false, user: null, action: null });
  };

  const handleDetailClose = () => {
    setDetailUserId(null);
  };

  const handleModalSuccess = (msg) => {
    showToast(msg);
  };

  const handleModalError = (msg) => {
    showToast(msg, "error");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-[#8b9e7e] mb-1">
            <Users size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Administración
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-serif italic">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 text-sm">
            Administra el acceso de adoptantes, albergues y administradores.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.rol}
          onChange={(e) => setFilters((prev) => ({ ...prev, rol: e.target.value }))}
          aria-label="Filtrar por rol"
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 focus:border-[#8b9e7e]"
        >
          <option value="">Todos los roles</option>
          <option value="adoptante">Adoptante</option>
          <option value="albergue">Albergue</option>
          <option value="administrador">Administrador</option>
        </select>

        <select
          value={filters.estado}
          onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))}
          aria-label="Filtrar por estado"
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b9e7e]/30 focus:border-[#8b9e7e]"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="suspendido">Suspendido</option>
        </select>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl flex flex-col items-center gap-3 text-center">
          <AlertTriangle size={28} className="text-rose-400" />
          <p className="text-rose-900 font-bold">Ocurrió un error al cargar los usuarios.</p>
          <p className="text-rose-600 text-xs max-w-md">{error?.message || "Error de conexión con el servidor."}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors"
          >
            <RefreshCw size={14} strokeWidth={2.5} />
            Reintentar
          </button>
        </div>
      )}

      <UserTable
        users={users}
        loading={isLoading}
        onAction={handleAction}
        onDetail={handleDetail}
      />

      <UserStatusModal
        isOpen={modalState.open}
        onClose={handleModalClose}
        user={modalState.user}
        action={modalState.action}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
      />

      <UserDetailModal
        isOpen={!!detailUserId}
        onClose={handleDetailClose}
        userId={detailUserId}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
