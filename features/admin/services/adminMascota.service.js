import { apiClient } from "@/lib/http/api-client";

/**
 * List all mascotas for admin supervision.
 * GET /api/admin/mascotas
 */
export async function getAdminMascotas({ page = 1, limit = 20, estado, albergue } = {}) {
  const params = new URLSearchParams({ page, limit, ...(estado && { estado }), ...(albergue && { albergue }) }).toString();
  const { data } = await apiClient.get(`/api/admin/mascotas?${params}`);
  return data;
}

/**
 * Get detail of a single mascota.
 * GET /api/admin/mascotas/:id
 */
export async function getMascotaDetalle(id) {
  const { data } = await apiClient.get(`/api/admin/mascotas/${id}`);
  return data;
}

/**
 * Get moderation history for a mascota.
 * GET /api/admin/mascotas/:id/historial-moderacion
 */
export async function getMascotaHistorial(id) {
  const { data } = await apiClient.get(`/api/admin/mascotas/${id}/historial-moderacion`);
  return data;
}

/**
 * Hide or reactivate a mascota (admin action).
 * PATCH /api/admin/mascotas/:id/estado
 */
export async function cambiarEstadoAdminMascota(id, estado, motivo) {
  const { data } = await apiClient.patch(`/api/admin/mascotas/${id}/estado`, { estado, motivo });
  return data;
}
