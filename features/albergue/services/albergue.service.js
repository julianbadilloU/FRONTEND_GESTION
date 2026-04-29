import { apiClient } from "@/lib/http/api-client";

export async function createAlbergueProfile(payload) {
  const { data } = await apiClient.post("/api/albergue/perfil", payload);
  return data;
}

export async function getAlbergueProfile() {
  const { data } = await apiClient.get("/api/albergue/perfil");
  return data?.data; // Returns directly the inner data object
}

export async function updateAlbergueProfile(payload) {
  const { data } = await apiClient.put("/api/albergue/perfil", payload);
  return data;
}
