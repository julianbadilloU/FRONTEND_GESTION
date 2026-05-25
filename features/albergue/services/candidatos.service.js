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
 * Obtiene la lista de matches del albergue, filtrados por mascota si se indica.
 * Endpoint: GET /api/shelters/matches?id_mascota=...
 */
export async function getCandidatosPorMascota(idMascota) {
  const { data } = await apiClient.get(
    `/api/shelters/matches?id_mascota=${idMascota}`
  );
  return extractData(data);
}

/**
 * Obtiene los matches del albergue autenticado junto con el conteo de candidatos.
 * Endpoint: GET /api/shelters/matches
 */
export async function getMisCandidatos() {
  const { data } = await apiClient.get("/api/shelters/matches");
  return extractData(data);
}

/**
 * HU-MCH-02: Registra el contacto WhatsApp con un adoptante.
 * Actualiza el estado del match a "contactado".
 * Endpoint: POST /api/shelters/matches/:id/contact
 */
export async function contactarAdoptante(idMatch) {
  const { data } = await apiClient.post(`/api/shelters/matches/${idMatch}/contact`);
  return extractData(data);
}

/**
 * Obtiene el historial de contactos de un match específico.
 * Endpoint: GET /api/shelters/matches/:id/historial
 */
export async function getHistorialContactos(idMatch) {
  const { data } = await apiClient.get(`/api/shelters/matches/${idMatch}/historial`);
  return extractData(data);
}

/**
 * Construye la URL de WhatsApp con mensaje predefinido.
 * @param {string} whatsapp - Número colombiano (ej: 3001234567 o +573001234567)
 * @param {string} nombreAdoptante - Nombre del adoptante
 * @param {string} nombreMascota - Nombre de la mascota
 */
export function buildWhatsAppUrl(whatsapp, nombreAdoptante, nombreMascota) {
  // Normalizar número: eliminar espacios, guiones, paréntesis
  let numero = String(whatsapp || "").replace(/[\s\-().]/g, "");

  // Agregar prefijo de Colombia si no lo tiene
  if (numero.startsWith("3") && numero.length === 10) {
    numero = `57${numero}`;
  } else if (numero.startsWith("+")) {
    numero = numero.slice(1);
  }

  const mensaje = encodeURIComponent(
    `Hola ${nombreAdoptante}, te contactamos desde FurMatch porque tu perfil es compatible con ${nombreMascota}. ¿Te gustaría conocerlo/a?`
  );

  return `https://wa.me/${numero}?text=${mensaje}`;
}
