import { apiClient } from "@/lib/http/api-client";

export async function getEstadisticas(params = {}) {
  const queryParams = {};
  if (params.desde) queryParams.desde = params.desde;
  if (params.hasta) queryParams.hasta = params.hasta;
  const { data } = await apiClient.get("/api/admin/estadisticas", {
    params: queryParams,
  });
  return data.data ?? data;
}
