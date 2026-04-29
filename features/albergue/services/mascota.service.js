import { apiClient } from "@/lib/http/api-client";

export async function createMascota(payload) {
  const { data } = await apiClient.post("/api/mascotas", payload, {
    timeout: 60_000,
  });
  return data;
}

export async function getEtiquetas() {
  const { data } = await apiClient.get("/api/etiquetas");
  return data;
}

export function parseMascotaError(err) {
  const status = err?.response?.status;
  const body = err?.response?.data;

  if (status === 400) {
    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      const first = body.errors[0];
      return {
        type: "validation",
        message: first.message || "Datos inválidos.",
        field: first.field,
        all: body.errors,
      };
    }
    return {
      type: "validation",
      message: body?.message || "Datos inválidos.",
    };
  }

  if (status === 401) {
    return {
      type: "auth",
      message: body?.message || "Sesión expirada. Inicia sesión nuevamente.",
    };
  }

  if (status === 403) {
    return {
      type: "forbidden",
      message:
        body?.message || "No tienes permisos para acceder a este recurso.",
    };
  }

  if (status === 413) {
    return {
      type: "size",
      message:
        "Las fotos exceden el tamaño máximo permitido. Comprime las imágenes e intenta de nuevo.",
    };
  }

  return {
    type: "server",
    message:
      "Ocurrió un error al publicar la mascota. No se guardó ningún dato. Por favor, intenta de nuevo.",
  };
}

export async function getMascotas() {
  const { data } = await apiClient.get("/api/mascotas");
  return data;
}

export async function updateMascotaEstado(id, payload) {
  const { data } = await apiClient.patch(`/api/mascotas/${id}/estado`, payload);
  return data;
}

export async function getMascotaById(id) {
  const { data } = await apiClient.get(`/api/mascotas/${id}`);
  return data;
}


