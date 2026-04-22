import axios from "axios";
import { authStorage } from "./storage";

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiBaseUrl) {
  console.warn("Defina EXPO_PUBLIC_API_URL no seu arquivo .env.local para conectar na API.");
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
  if (!apiBaseUrl) {
    return Promise.reject(new Error("Configure EXPO_PUBLIC_API_URL no arquivo .env.local antes de chamar a API."));
  }

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
