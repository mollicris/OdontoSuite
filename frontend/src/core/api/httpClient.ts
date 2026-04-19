import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../../features/auth/infrastructure/store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
httpClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle errors
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized (token inválido o expirado, pero NO en login)
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // No redirigir si es la ruta de login (credenciales inválidas)
      if (!url.includes('/auth/login')) {
        useAuthStore.getState().logout();
        // Redirigir suavemente sin recargar la página
        if (typeof globalThis !== 'undefined' && globalThis.location) {
          globalThis.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  },
);
