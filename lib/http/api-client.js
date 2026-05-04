import axios from "axios";

import { env } from "@/config/env";
import { getSessionTokens } from "@/lib/auth/token-storage";

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = getSessionTokens();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TEMP: protección de rutas desactivada para pruebas de navegación.
    // Restaurar este bloque cuando se vuelva a habilitar el guard de auth.
    // if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
    //   clearSessionTokens();
    //
    //   const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    //
    //   if (!isAuthRequest && typeof window !== "undefined") {
    //     window.location.href = "/login";
    //   }
    // }

    return Promise.reject(error);
  },
);
