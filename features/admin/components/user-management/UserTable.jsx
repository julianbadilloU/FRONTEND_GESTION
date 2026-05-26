"use client";

import { Eye, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ESTADO_BADGE = {
  activo: "bg-emerald-50 text-emerald-600",
  suspendido: "bg-rose-50 text-rose-600",
};

function formatFecha(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" });
}

export function UserTable({ users, loading, onAction, onDetail }) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-100 rounded w-32" />
              <div className="h-4 bg-gray-100 rounded w-40" />
              <div className="h-4 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-28" />
              <div className="h-4 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
          <Users size={24} className="text-gray-300" strokeWidth={1.5} />
        </div>
        <p className="text-gray-500 font-medium font-serif italic text-lg">
          No se encontraron usuarios.
        </p>
        <p className="text-gray-400 text-xs">
          Probá ajustando los filtros de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
              Nombre
            </th>
            <th className="hidden sm:table-cell px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
              Correo
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
              Rol
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
              Estado
            </th>
            <th className="hidden md:table-cell px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
              Fecha registro
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890] text-right">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-gray-900">{user.nombre || "-"}</span>
              </td>
              <td className="hidden sm:table-cell px-6 py-4">
                <span className="text-sm text-gray-600">{user.correo}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md capitalize">
                  {user.rol}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tighter",
                    ESTADO_BADGE[user.estado] ?? "bg-gray-100 text-gray-500"
                  )}
                >
                  {user.estado}
                </span>
              </td>
              <td className="hidden md:table-cell px-6 py-4">
                <span className="text-sm text-gray-500">{formatFecha(user.fecha_registro)}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDetail?.(user.id)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                    title="Ver detalle"
                  >
                    <Eye size={12} strokeWidth={2.5} />
                    Ver detalle
                  </button>
                  {user.estado === "suspendido" && (
                    <button
                      onClick={() => onAction(user, "activar")}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      Activar
                    </button>
                  )}
                  {user.estado === "activo" && (
                    <button
                      onClick={() => onAction(user, "suspender")}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      Suspender
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
