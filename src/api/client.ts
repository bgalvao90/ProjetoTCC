import axios from "axios";
import { authStorage } from "./storage";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

function validateApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error("Configure EXPO_PUBLIC_API_URL antes de chamar a API.");
  }

  const parsed = new URL(apiBaseUrl);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_API_URL deve usar HTTPS em producao.");
  }
  return apiBaseUrl;
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use(async (config) => {
  validateApiBaseUrl();

  const token = await authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await authStorage.clear();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);
