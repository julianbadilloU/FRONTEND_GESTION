import { apiClient } from "@/lib/http/api-client";

const extractData = (response) => {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return response;
  }
  if (response.success !== undefined && response.data !== undefined) {
    if (response.meta !== undefined) {
      return { data: response.data, meta: response.meta };
    }
    return response.data;
  }
  return response;
};

/**
 * HU-HIS-01: Registra una adopción completada seleccionando un adoptante contactado.
 * Endpoint: POST /api/adopciones
 * @param {{ id_mascota: number, id_adoptante: number, observaciones?: string }} datos
 */
export async function completarAdopcion(datos) {
  const { data } = await apiClient.post("/api/adopciones", datos);
  return extractData(data);
}

/**
 * Obtiene el historial de adopciones completadas del albergue autenticado.
 * Endpoint: GET /api/albergue/adopciones
 */
export async function obtenerHistorialAdopciones(params = {}) {
  const { data } = await apiClient.get("/api/albergue/adopciones", { params });
  return extractData(data);
}
