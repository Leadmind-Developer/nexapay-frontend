import axios, { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://nexapay-backend-138118361183.us-central1.run.app/api";

// Axios instance
const api = axios.create({
  baseURL: BACKEND,
  headers: new AxiosHeaders({ "Content-Type": "application/json" }),
  withCredentials: true, // ✅ allow sending HttpOnly cookies
});

// -------------------------------
// Request interceptor
// -------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (!config.headers) config.headers = new AxiosHeaders();

    // Always send platform
    config.headers.set("x-platform", "web");

    return config;
  },
  (error) => Promise.reject(error)
);

// Generic payload type
export type Payload = Record<string, unknown>;

// -------------------------------
// AUTH ROUTES
// -------------------------------
export const AuthAPI = {
  login: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/web/login", payload),

  register: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/web/register", payload),

  verify: <T>(): Promise<AxiosResponse<T>> => api.get("/auth/verify"),

  logout: <T>(): Promise<AxiosResponse<T>> => api.post("/auth/logout"),
};

export default api;
