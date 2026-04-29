import { apiClient } from "@/lib/http/api-client";

export async function createAdoptanteProfile(payload) {
  const { data } = await apiClient.post("/api/adoptante/perfil", payload);
  return data;
}

export async function getEtiquetas() {
  const { data } = await apiClient.get("/api/etiquetas");
  return data;
}
