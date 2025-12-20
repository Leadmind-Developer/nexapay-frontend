import axios, { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// -------------------------------
// ✅ BACKEND CONFIG
// -------------------------------
const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://nexapay-backend-138118361183.us-central1.run.app/api";

// Axios instance
const api = axios.create({
  baseURL: BACKEND,
  headers: new AxiosHeaders({ "Content-Type": "application/json" }),
  withCredentials: true, // ✅ send HttpOnly cookies automatically
});

// -------------------------------
// REQUEST INTERCEPTOR
// -------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (!config.headers) config.headers = new AxiosHeaders();

    // Always send platform
    config.headers.set("x-platform", "web");

    // No localStorage token injection — relies entirely on HttpOnly cookies

    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------
// GENERIC PAYLOAD TYPE
// -------------------------------
export type Payload = Record<string, unknown>;

// -------------------------------
// AUTH API
// -------------------------------
export const AuthAPI = {
  login: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/web/login", payload),

  register: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/web/register", payload),

  verify: <T>(): Promise<AxiosResponse<T>> => api.get("/auth/web/verify-session"),

  logout: <T>(): Promise<AxiosResponse<T>> => api.post("/auth/web/logout"),
};

// -------------------------------
// SMARTCASH API
// -------------------------------
export const SmartCashAPI = {
  pay: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/smartcash/pay", payload),

  disburse: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/smartcash/disburse", payload),

  collect: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/smartcash/collect", payload),

  remit: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/smartcash/remit", payload),

  bulk: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/smartcash/bulk", payload),

  generateVAN: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/smartcash/generate-van", payload),
};

// -------------------------------
// VTPASS API
// -------------------------------
export const VTPassAPI = {
  verify: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/vtpass/verify", payload),

  pay: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/vtpass/pay", payload),

  status: <T>(request_id: string): Promise<AxiosResponse<T>> =>
    api.get(`/vtpass/status/${request_id}`),
};

// -------------------------------
// EXPORT DEFAULT AXIOS INSTANCE
// -------------------------------
export default api;
