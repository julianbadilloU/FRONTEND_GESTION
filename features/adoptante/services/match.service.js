/**
 * match.service.js
 * Servicios para el historial de matches del adoptante.
 * HU-MCH-03 – Sprint 4
 *
 * Endpoints consumidos:
 * GET /api/adopters/matches → lista paginada de matches
 * GET /api/matches/:id → detalle de un match
 */

import { apiClient } from "@/lib/http/api-client";

/**
 * Obtiene el historial de matches del adoptante autenticado.
 *
 * @param {object} params
 * @param {string} [params.estado] - "pendiente" | "aceptado" | "rechazado" | "adoptado"
 * @param {string} [params.fecha_desde] - ISO date string (YYYY-MM-DD)
 * @param {string} [params.fecha_hasta] - ISO date string (YYYY-MM-DD)
 * @param {number} [params.limit] - resultados por página (default 10)
 * @param {number} [params.offset] - desplazamiento para paginación (default 0)
 * @returns {Promise<{data: Match[], pagination: Pagination}>}
 */
export async function getMatchesAdoptante(params = {}) {
  // Eliminar claves vacías para no ensuciar la query string
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );
  const query = new URLSearchParams(cleanParams).toString();
  const url = query ? `/api/match?${query}` : "/api/match";
  const { data } = await apiClient.get(url);
  return data;
}

/**
 * Obtiene el detalle de un match específico.
 *
 * @param {number|string} idMatch
 * @returns {Promise<{data: Match}>}
 */
export async function getMatchById(idMatch) {
  const { data } = await apiClient.get(`/api/match/${idMatch}`);
  return data;
}


