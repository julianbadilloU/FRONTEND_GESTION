import { apiClient } from "@/lib/http/api-client";

const extractData = (response) => {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
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

export async function createAlbergueProfile(payload) {
  const { data } = await apiClient.post("/api/albergue/perfil", payload);
  return extractData(data);
}

export async function getAlbergueProfile() {
  try {
    const { data } = await apiClient.get("/api/albergue/perfil");
    return extractData(data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateAlbergueProfile(payload) {
  const { data } = await apiClient.put("/api/albergue/perfil", payload);
  return extractData(data);
}
