import { apiClient } from "@/lib/http/api-client";

export async function getEstadisticas() {
  const { data } = await apiClient.get("/api/admin/estadisticas");
  return data.data ?? data;
}
