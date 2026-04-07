import { apiClient } from "@/lib/http/api-client";
import { clearSessionTokens } from "@/lib/auth/token-storage";

/**
 * Cierra la sesión del usuario invalidando el token JWT en el servidor 
 * y limpiando el almacenamiento local.
 */
export async function logoutUser() {
  try {
    await apiClient.post("/api/auth/logout");
  } catch (error) {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn("Token inválido, expirado o ya en blacklist.");
      } else if (status === 500) {
        console.error("Error interno del servidor al cerrar sesión.");
      } else {
        console.error("Error inesperado al cerrar sesión.");
      }
    } else {
      console.error("Error de red al intentar cerrar sesión.");
    }
  } finally {
    // Independientemente del resultado en el servidor, limpiamos los tokens locales
    clearSessionTokens();
  }
}
