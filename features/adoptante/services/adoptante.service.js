import { apiClient } from "@/lib/http/api-client";

export async function createAdoptanteProfile(payload) {
  const { data } = await apiClient.post("/api/adoptante/perfil", payload);
  return data;
}

export async function getAdoptanteProfile() {
  const { data } = await apiClient.get("/api/adoptante/perfil");
  return data;
}

export async function updateAdoptanteProfile(payload) {
  const { data } = await apiClient.put("/api/adoptante/perfil", payload);
  return data;
}

export async function getEtiquetas() {
  const { data } = await apiClient.get("/api/etiquetas");
  return data;
}

export async function getFeedMascotas(params = {}) {
  const query = new URLSearchParams(params).toString();
  const { data } = await apiClient.get(`/api/mascotas/feed?${query}`);
  return data;
}

export async function getMatchMascotas() {
  const { data } = await apiClient.get("/api/mascotas/match");
  return data;
}
