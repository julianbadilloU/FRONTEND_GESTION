import { apiClient } from "@/lib/http/api-client";

export async function createMascota(payload) {
  const { data } = await apiClient.post("/api/mascotas", payload);
  return data;
}

export async function getEtiquetas() {
  const { data } = await apiClient.get("/api/etiquetas");
  return data;
}

export async function getMascotas() {
  const { data } = await apiClient.get("/api/mascotas");
  return data;
}

export async function getMascota(id) {
  // MOCK DATA PARA PRUEBAS SIN BACKEND
  if (id === "demo") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: "demo",
          nombre: "Firulais (Mascota Demo)",
          nombre_albergue: "Albergue de Prueba",
          estado_adopcion: "disponible",
          fotos: [
            {
              url_foto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=256&h=256&fit=crop",
            },
          ],
        });
      }, 800); // Simulamos retraso de red
    });
  }

  const { data } = await apiClient.get(`/api/mascotas/${id}`);
  return data;
}

export async function updateMascotaEstado(id, payload) {
  // MOCK DATA PARA PRUEBAS SIN BACKEND
  if (id === "demo") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, estado: payload.estado_adopcion });
      }, 1000); // Simulamos retraso de red
    });
  }

  const { data } = await apiClient.patch(`/api/mascotas/${id}/estado`, payload);
  return data;
}

