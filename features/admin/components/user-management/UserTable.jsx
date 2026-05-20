"use client";

import { Loader2 } from "lucide-react";
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

export function UserTable({ users, loading, onAction }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#8b9e7e]" size={32} />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-medium font-serif italic text-lg">
          No se encontraron usuarios.
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
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
              Correo
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
              Rol
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
              Estado
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#a09890]">
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
              <td className="px-6 py-4">
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
              <td className="px-6 py-4">
                <span className="text-sm text-gray-500">{formatFecha(user.fecha_registro)}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
