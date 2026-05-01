import { apiClient } from "@/lib/http/api-client";
import { mapTagFromBackend, mapTagToBackend } from "@/features/admin/utils/tag-mapper";

export async function getTags() {
  const { data } = await apiClient.get("/api/admin/etiquetas");
  // El backend retorna { success: true, data: [...] }
  // Extraemos el array interno y mapeamos cada tag
  const tags = data?.data || [];
  return tags.map(mapTagFromBackend);
}

export async function createTag(payload) {
  // Mapear del formato frontend al formato backend
  const backendPayload = mapTagToBackend(payload);
  const { data } = await apiClient.post("/api/admin/etiquetas", backendPayload);
  return data;
}

export async function updateTag(id, payload) {
  // Mapear del formato frontend al formato backend
  const backendPayload = mapTagToBackend(payload);
  const { data } = await apiClient.put(`/api/admin/etiquetas/${id}`, backendPayload);
  return data;
}

export async function deleteTag(id) {
  const { data } = await apiClient.delete(`/api/admin/etiquetas/${id}`);
  return data;
}

export async function addTagOption(id, payload) {
  const { data } = await apiClient.post(`/api/admin/etiquetas/${id}/opciones`, payload);
  return data;
}
