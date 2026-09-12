import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "./stores/auth-store";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // sends refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor attaches Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor handles automatic token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If unauthorized and hasn't retried yet, and not calling login/refresh/register
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/register")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data?.data?.accessToken;
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          useAuthStore.getState().clearAuth();
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        useAuthStore.getState().clearAuth();
        processQueue(refreshErr as AxiosError, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
