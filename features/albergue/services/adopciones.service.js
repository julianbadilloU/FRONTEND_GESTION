import { apiClient } from "@/lib/http/api-client";

const extractData = (response) => {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return response;
  }
  if (response.success !== undefined && response.data !== undefined) {
    if (response.meta !== undefined) {
      return { data: response.data, meta: response.meta };
    }
    return response.data;
  }
  return response;
};

/**
 * HU-HIS-01: Registra una adopción completada seleccionando un adoptante contactado.
 * Endpoint: POST /api/adopciones
 * @param {{ id_mascota: number, id_adoptante: number, observaciones?: string }} datos
 */
export async function completarAdopcion(datos) {
  const { data } = await apiClient.post("/api/adopciones", datos);
  return extractData(data);
}

/**
 * Obtiene el historial de adopciones completadas del albergue autenticado.
 * Endpoint: GET /api/albergue/adopciones
 */
export async function obtenerHistorialAdopciones(params = {}) {
  const { data } = await apiClient.get("/api/albergue/adopciones", { params });
  return extractData(data);
}

/**
 * Descarga el historial de adopciones como archivo CSV.
 * Endpoint: GET /api/albergue/adopciones/exportar
 */
export async function exportarCSV(params = {}) {
  const { data } = await apiClient.get("/api/albergue/adopciones/exportar", {
    params,
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([data], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "adopciones.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Descarga el historial de adopciones como archivo Excel.
 * Endpoint: GET /api/albergue/adopciones/exportar-excel
 */
export async function exportarExcel(params = {}) {
  const { data } = await apiClient.get("/api/albergue/adopciones/exportar-excel", {
    params,
    responseType: "blob",
  });
  const url = URL.createObjectURL(
    new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "adopciones.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
