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
