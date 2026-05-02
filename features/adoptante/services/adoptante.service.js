import { apiClient } from "@/lib/http/api-client";

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

export async function createAdoptanteProfile(payload) {
  const { data } = await apiClient.post("/api/adoptante/perfil", payload);
  return extractData(data);
}

export async function getAdoptanteProfile() {
  const { data } = await apiClient.get("/api/adoptante/perfil");
  return extractData(data);
}

export async function updateAdoptanteProfile(payload) {
  const { data } = await apiClient.put("/api/adoptante/perfil", payload);
  return extractData(data);
}

export async function getEtiquetas() {
  const { data } = await apiClient.get("/api/etiquetas");
  return extractData(data);
}

export async function getFeedMascotas(params = {}) {
  const query = new URLSearchParams(params).toString();
  const { data } = await apiClient.get(`/api/mascotas/feed?${query}`);
  return extractData(data);
}

export async function getMatchMascotas() {
  const { data } = await apiClient.get("/api/mascotas/match");
  return extractData(data);
}
