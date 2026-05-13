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
 * Obtiene la lista de mascotas del albergue con sus candidatos (matches).
 * Endpoint: GET /api/matches/candidatos?id_mascota=...
 */
export async function getCandidatosPorMascota(idMascota) {
  const { data } = await apiClient.get(
    `/api/matches/candidatos?id_mascota=${idMascota}`
  );
  return extractData(data);
}

/**
 * Obtiene las mascotas del albergue autenticado junto con el conteo de candidatos.
 * Endpoint: GET /api/matches/mis-candidatos
 */
export async function getMisCandidatos() {
  const { data } = await apiClient.get("/api/matches/mis-candidatos");
  return extractData(data);
}

/**
 * HU-WA-01: Registra el contacto WhatsApp con un adoptante.
 * Actualiza el estado del match a "contactado".
 * Endpoint: POST /api/matches/:idMatch/contactar
 */
export async function contactarAdoptante(idMatch) {
  const { data } = await apiClient.post(`/api/matches/${idMatch}/contactar`);
  return extractData(data);
}

/**
 * Obtiene el historial de contactos de un match específico.
 * Endpoint: GET /api/matches/:idMatch/historial
 */
export async function getHistorialContactos(idMatch) {
  const { data } = await apiClient.get(`/api/matches/${idMatch}/historial`);
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
    `Hola ${nombreAdoptante}, te contactamos desde FurMatch porque tu perfil es compatible con ${nombreMascota}. ¿Te gustaría conocerlo/a? 🐾`
  );

  return `https://wa.me/${numero}?text=${mensaje}`;
}
