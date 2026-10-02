import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('navapai_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh handling & invalid token fallback for public endpoints
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('navapai_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}auth/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = res.data;
          localStorage.setItem('navapai_access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('navapai_access_token');
          localStorage.removeItem('navapai_refresh_token');
          localStorage.removeItem('navapai_user');
        }
      } else {
        localStorage.removeItem('navapai_access_token');
      }

      // Strip invalid Authorization header and retry once for public endpoints
      if (originalRequest.headers?.Authorization) {
        delete originalRequest.headers.Authorization;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);


export default api;
