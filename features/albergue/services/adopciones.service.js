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
 * HU-ADP-01: Completa el proceso de adopción seleccionando un adoptante.
 * Endpoint: POST /api/adopciones/:id/completar
 * @param {number|string} idAdopcion - ID del proceso de adopción
 * @param {{ idAdoptanteSeleccionado: number, notas?: string }} datos
 */
export async function completarAdopcion(idAdopcion, datos) {
  const { data } = await apiClient.post(
    `/api/adopciones/${idAdopcion}/completar`,
    datos
  );
  return extractData(data);
}

/**
 * Obtiene el historial de adopciones completadas del albergue autenticado.
 * Endpoint: GET /api/albergue/adopciones
 */
export async function obtenerHistorialAdopciones() {
  const { data } = await apiClient.get("/api/albergue/adopciones");
  return extractData(data);
}
