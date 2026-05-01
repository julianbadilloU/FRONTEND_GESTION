import { apiClient } from "@/lib/http/api-client";

export async function getTags() {
  const { data } = await apiClient.get("/api/admin/etiquetas");
  // El backend retorna { success: true, data: [...] }
  // Extraemos el array interno
  return data?.data || [];
}

export async function createTag(payload) {
  const { data } = await apiClient.post("/api/admin/etiquetas", payload);
  return data;
}

export async function updateTag(id, payload) {
  const { data } = await apiClient.put(`/api/admin/etiquetas/${id}`, payload);
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
