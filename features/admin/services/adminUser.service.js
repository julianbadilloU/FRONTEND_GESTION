import { apiClient } from "@/lib/http/api-client";

export async function getUsuarios({ rol = "", estado = "" } = {}) {
  const params = {};
  if (rol) params.rol = rol;
  if (estado) params.estado = estado;
  const { data } = await apiClient.get("/api/admin/usuarios", { params });
  return data.data ?? data;
}

export async function cambiarEstadoUsuario(id, { estado, motivo }) {
  const { data } = await apiClient.patch(`/api/admin/usuarios/${id}/estado`, { estado, motivo });
  return data.data ?? data;
}

export async function eliminarUsuario(id) {
  const { data } = await apiClient.delete(`/api/admin/usuarios/${id}`);
  return data.data ?? data;
}
