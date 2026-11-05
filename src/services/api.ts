import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fisio_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isPatientRoute = window.location.pathname.startsWith('/paciente');
      // Clear token only if on a protected route
      if (window.location.pathname.startsWith('/gestao') || isPatientRoute) {
        localStorage.removeItem('fisio_auth_token');
        localStorage.removeItem('fisio_user_data');
        if (isPatientRoute) {
          window.location.href = '/login/paciente';
        } else {
          window.location.href = '/login/gestao';
        }
      }
    }
    return Promise.reject(error);
  }
);

