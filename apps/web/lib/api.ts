import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "./stores/auth-store";

export const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://api-production-f170.up.railway.app/api/v1";
  }
  return "http://localhost:8080/api/v1";
};

const baseURL = getBaseURL();

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
    let token = useAuthStore.getState().accessToken;
    if (!token && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("dineflow_auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed?.state?.accessToken || null;
        }
      } catch {}
    }
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

      // Extract refresh token & user from Zustand store or persisted localStorage
      let refreshToken = useAuthStore.getState().refreshToken;
      let user = useAuthStore.getState().user;
      if ((!refreshToken || !user) && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("dineflow_auth");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (!refreshToken) refreshToken = parsed?.state?.refreshToken || null;
            if (!user) user = parsed?.state?.user || null;
          }
        } catch {}
      }

      const isDemoUser = Boolean(
        user?.phone === "+919876543210" ||
        user?.email === "admin@thegrandbistro.com" ||
        user?.email === "superadmin@dineflow.io" ||
        useAuthStore.getState().tenant?.slug === "the-grand-bistro"
      );

      try {
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          refreshToken ? { refreshToken } : {},
          { withCredentials: true }
        );

        const newAccessToken = data?.data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken;
        if (newAccessToken) {
          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshErr: any) {
        processQueue(refreshErr as AxiosError, null);
        const status = refreshErr?.response?.status;
        const isDefiniteAuthFailure = status === 401 || status === 403;

        // ONLY clear auth and redirect if the backend explicitly rejected the refresh token as 401 or 403
        // Transient network errors, 5xx server errors, or offline status should NEVER kick the user out!
        if (isDefiniteAuthFailure && !isDemoUser) {
          useAuthStore.getState().clearAuth();
          if (
            typeof window !== "undefined" &&
            (window.location.pathname.startsWith("/dashboard") ||
             window.location.pathname.startsWith("/platform"))
          ) {
            window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}&expired=true`;
          }
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiErrorResponse {
  error?: { message?: string };
  message?: string;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    return (
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      fallback
    );
  }
  if (err instanceof Error) {
    return err.message || fallback;
  }
  return fallback;
}
