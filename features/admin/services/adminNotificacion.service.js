import { apiClient } from "@/lib/http/api-client";

export async function getNotificacionesAdmin({ tipo = "", page = 1, limit = 50, desde = "", hasta = "" } = {}) {
  const params = {};
  if (tipo) params.tipo = tipo;
  if (page) params.page = page.toString();
  if (limit) params.limit = limit.toString();
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  const { data } = await apiClient.get("/api/admin/notificaciones", { params });
  return data;
}

export async function eliminarNotificacionAdmin(id) {
  const { data } = await apiClient.delete(`/api/admin/notificaciones/${id}`);
  return data;
}
