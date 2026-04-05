import axios from "axios";

import { env } from "@/config/env";
import { clearSessionTokens, getSessionTokens } from "@/lib/auth/token-storage";

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
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearSessionTokens();
    }

    return Promise.reject(error);
  },
);
