import { apiClient } from "@/lib/http/api-client";

export async function createAlbergueProfile(payload) {
  const { data } = await apiClient.post("/api/albergue/perfil", payload);
  return data;
}
