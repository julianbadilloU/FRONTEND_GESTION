import { apiClient } from "@/lib/http/api-client";

/**
 * Obtiene las notificaciones del usuario autenticado.
 * @param {Object} options - { soloNoLeidas, limit }
 * @returns {Promise<Object>} { success, data, total_no_leidas }
 */
export async function getNotificaciones({ soloNoLeidas = false, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (soloNoLeidas) params.set("solo_no_leidas", "true");
  if (limit) params.set("limit", limit.toString());

  const { data } = await apiClient.get(`/api/notificaciones?${params.toString()}`);
  return data;
}

/**
 * Marca una notificación como leída.
 * @param {number} id - ID de la notificación
 * @returns {Promise<Object>}
 */
export async function marcarLeida(id) {
  const { data } = await apiClient.patch(`/api/notificaciones/${id}/leida`);
  return data;
}

/**
 * Marca todas las notificaciones como leídas.
 * @returns {Promise<Object>}
 */
export async function marcarTodasLeidas() {
  const { data } = await apiClient.patch("/api/notificaciones/leidas");
  return data;
}
