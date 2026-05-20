import { apiClient } from "@/lib/http/api-client";

/**
 * Fetches all system configuration grouped by section.
 *
 * @returns {Promise<Record<string, Record<string, string>>>}
 * Example: { publicacion: { limite_mascotas: "50", ... }, matching: { ... } }
 */
export async function getConfiguracion() {
  const { data } = await apiClient.get("/api/admin/configuracion");
  return data.data ?? data;
}

/**
 * Updates all values for a given configuration group.
 *
 * @param {string} grupo - Group key (e.g. "publicacion", "seguridad")
 * @param {Record<string, string|number>} values - Short-key/value pairs to persist
 * @returns {Promise<Record<string, string>>} Updated group values
 */
export async function updateConfiguracionGrupo(grupo, values) {
  const { data } = await apiClient.put(`/api/admin/configuracion/${grupo}`, values);
  return data.data ?? data;
}
