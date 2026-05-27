"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, AlertCircle, ClipboardList, Check } from "lucide-react";
import { ClientAuthGuard } from "@/features/shared/components/ClientAuthGuard";
import {
  obtenerHistorialAdopciones,
  finalizarAdopcion,
} from "@/features/albergue/services/adopciones.service";

function EstadoBadge({ estado }) {
  const config = {
    completado: {
      label: "Completado",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Icon: CheckCircle2,
    },
    en_proceso: {
      label: "En proceso",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      Icon: Clock,
    },
    pendiente: {
      label: "Pendiente",
      className: "bg-blue-50 text-blue-700 border-blue-100",
      Icon: Clock,
    },
  };

  const { label, className, Icon } =
    config[estado] ?? {
      label: estado ?? "—",
      className: "bg-gray-50 text-gray-500 border-gray-100",
      Icon: AlertCircle,
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdopcionesHistorialPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["historial-adopciones"],
    queryFn: obtenerHistorialAdopciones,
  });

  const completarMutation = useMutation({
    mutationFn: finalizarAdopcion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["historial-adopciones"] });
    },
  });

  const handleCompletar = (id) => {
    if (window.confirm("¿Estás seguro de que deseas completar esta adopción?")) {
      completarMutation.mutate(id);
    }
  };

  // The service's extractData returns either the array directly or
  // an object { data: [], meta: {} } depending on the API response shape.
  const adopciones = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <ClientAuthGuard allowedRoles={["albergue"]}>
      <div className="min-h-screen bg-[#fafaf8]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Historial de Adopciones</h1>
            <p className="text-gray-500 text-sm mt-1">
              Registro completo de las adopciones completadas por tu albergue
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-red-100">
              <AlertCircle size={48} className="mx-auto text-red-300 mb-4" />
              <p className="text-red-500 font-medium">Error al cargar el historial.</p>
              <p className="text-gray-400 text-sm mt-1">Intenta de nuevo más tarde.</p>
            </div>
          ) : adopciones.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Aún no hay adopciones completadas.</p>
              <p className="text-gray-400 text-sm mt-1">
                Las adopciones finalizadas aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">
                        Mascota
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">
                        Adoptante
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">
                        Fecha de adopción
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">
                        Estado
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {adopciones.map((adopcion, index) => {
                      const id =
                        adopcion.id_adopcion ??
                        adopcion.id ??
                        index;

                      const petName =
                        adopcion.mascota?.nombre ??
                        adopcion.nombre_mascota ??
                        "—";

                      const adopterName =
                        adopcion.adoptante?.nombre ??
                        adopcion.nombre_adoptante ??
                        "—";

                      const date =
                        adopcion.fecha_adopcion ??
                        adopcion.fecha_completado ??
                        adopcion.createdAt ??
                        null;

                      const estado =
                        adopcion.estado ??
                        adopcion.status ??
                        "completado";

                      return (
                        <tr
                          key={id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 text-sm">
                              {petName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700">{adopterName}</span>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="text-sm text-gray-500">{formatDate(date)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <EstadoBadge estado={estado} />
                          </td>
                          <td className="px-6 py-4">
                            {estado === "en_proceso" && (
                              <button
                                onClick={() => handleCompletar(id)}
                                disabled={completarMutation.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200 text-xs font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Check size={14} />
                                {completarMutation.isPending
                                  ? "Completando..."
                                  : "Completar Adopción"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientAuthGuard>
  );
}
