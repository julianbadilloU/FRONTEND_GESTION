import { apiClient } from "@/lib/http/api-client";

export async function getNotificacionesAdmin({ tipo = "", page = 1, limit = 50 } = {}) {
  const params = {};
  if (tipo) params.tipo = tipo;
  if (page) params.page = page.toString();
  if (limit) params.limit = limit.toString();
  const { data } = await apiClient.get("/api/admin/notificaciones", { params });
  return data;
}
