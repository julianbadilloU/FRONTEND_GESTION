import { apiClient } from "@/lib/http/api-client";

export async function createMascota(payload) {
  const { data } = await apiClient.post("/api/mascotas", payload);
  return data;
}

export async function getEtiquetas() {
  const { data } = await apiClient.get("/api/etiquetas");
  return data;
}

export async function getMascotas() {
  const { data } = await apiClient.get("/api/mascotas");
  return data;
}

export async function updateMascotaEstado(id, payload) {
  const { data } = await apiClient.patch(`/api/mascotas/${id}/estado`, payload);
  return data;
}

export async function getMascotaById(id) {
  const { data } = await apiClient.get(`/api/mascotas/${id}`);
  return data;
}

export async function updateMascota(id, payload) {
  const { data } = await apiClient.put(`/api/mascotas/${id}`, payload);
  return data;
}

export async function getMisMascotas(params = {}) {
  const query = new URLSearchParams(params).toString();
  const { data } = await apiClient.get(`/api/mascotas/mis-mascotas?${query}`);
  return data;
}

export async function deleteMascota(id, motivo) {
  const { data } = await apiClient.delete(`/api/mascotas/${id}`, {
    data: { motivo },
  });
  return data;
}
