import { apiClient } from "@/lib/http/api-client";

export async function exportarDatos() {
  const response = await apiClient.get("/api/usuario/datos");
  const data = response.data;

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mis-datos-furmatch.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function solicitarCodigoEliminacion() {
  const response = await apiClient.post("/api/usuario/solicitar-eliminacion");
  return response.data;
}

export async function eliminarCuenta(codigo) {
  const response = await apiClient.delete("/api/usuario/cuenta", {
    data: { codigo },
  });
  return response.data;
}