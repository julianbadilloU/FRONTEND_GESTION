import { apiClient } from "@/lib/http/api-client";
import { mapTagFromBackend, mapTagToBackend } from "@/features/admin/utils/tag-mapper";

const extractData = (response) => {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
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

export async function getTags() {
  const { data } = await apiClient.get("/api/admin/etiquetas");
  const tags = extractData(data) || [];
  return tags.map(mapTagFromBackend);
}

export async function createTag(payload) {
  const backendPayload = mapTagToBackend(payload);
  const { data } = await apiClient.post("/api/admin/etiquetas", backendPayload);
  return extractData(data);
}

export async function updateTag(id, payload) {
  const backendPayload = mapTagToBackend(payload);
  const { data } = await apiClient.put(`/api/admin/etiquetas/${id}`, backendPayload);
  return extractData(data);
}

export async function deleteTag(id) {
  const { data } = await apiClient.delete(`/api/admin/etiquetas/${id}`);
  return extractData(data);
}

export async function addTagOption(id, payload) {
  // Backend espera { opciones: string[] }
  const opcionValue = payload.nombre || payload.valor || payload;
  const { data } = await apiClient.post(`/api/admin/etiquetas/${id}/opciones`, {
    opciones: [opcionValue],
  });
  return extractData(data);
}

export async function deleteTagOption(idTag, idOpcion) {
  const { data } = await apiClient.delete(`/api/admin/etiquetas/${idTag}/opciones/${idOpcion}`);
  return extractData(data);
}
