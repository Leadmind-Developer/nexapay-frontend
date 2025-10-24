import axios, {
  InternalAxiosRequestConfig,
  AxiosHeaders,
  AxiosResponse,
} from "axios";

// -------------------------------
// ✅ BASE CONFIGURATION
// -------------------------------
const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://nexapay-backend-138118361183.us-central1.run.app/api";

const api = axios.create({
  baseURL: BACKEND,
  headers: new AxiosHeaders({ "Content-Type": "application/json" }),
});

// -------------------------------
// ✅ TOKEN ATTACHMENT (Client-side only)
// -------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (!config.headers) config.headers = new AxiosHeaders();
      else if (!(config.headers instanceof AxiosHeaders))
        config.headers = new AxiosHeaders(config.headers);

      if (token) config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Generic payload type
export type Payload = Record<string, unknown>;

// -------------------------------
// ✅ SMARTCASH ROUTES
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
// ✅ VTPASS ROUTES
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
// ✅ TRANSACTIONS
// -------------------------------
export const TransactionsAPI = {
  list: <T>(): Promise<AxiosResponse<T>> => api.get("/transactions"),
};

// -------------------------------
// ✅ AUTH
// -------------------------------
export const AuthAPI = {
  login: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/login", payload),

  register: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/register", payload),
};

// -------------------------------
// ✅ WEBHOOKS
// -------------------------------
export const WebhooksAPI = {
  list: <T>(): Promise<AxiosResponse<T>> => api.get("/webhook"),
};

// -------------------------------
// ✅ SAVINGS ROUTES
// -------------------------------
export const SavingsAPI = {
  list: <T>(): Promise<AxiosResponse<T>> => api.get("/savings"),
  create: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/savings", payload),
  getById: <T>(id: string): Promise<AxiosResponse<T>> =>
    api.get(`/savings/${id}`),
  update: <T>(id: string, payload: Payload): Promise<AxiosResponse<T>> =>
    api.put(`/savings/${id}`, payload),
  delete: <T>(id: string): Promise<AxiosResponse<T>> =>
    api.delete(`/savings/${id}`),
};

// -------------------------------
// ✅ LOANS ROUTES
// -------------------------------
export const LoansAPI = {
  list: <T>(): Promise<AxiosResponse<T>> => api.get("/loans"),
  apply: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/loans/apply", payload),
  getById: <T>(id: string): Promise<AxiosResponse<T>> =>
    api.get(`/loans/${id}`),
  repay: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/loans/repay", payload),
};

// -------------------------------
// ✅ FUNDS ROUTES
// -------------------------------
export const FundsAPI = {
  list: <T>(): Promise<AxiosResponse<T>> => api.get("/funds"),
  add: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/funds/add", payload),
  withdraw: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/funds/withdraw", payload),
};

// -------------------------------
// ✅ WITHDRAWALS ROUTES
// -------------------------------
export const WithdrawalsAPI = {
  list: <T>(): Promise<AxiosResponse<T>> => api.get("/withdrawals"),
  request: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/withdrawals/request", payload),
  getById: <T>(id: string): Promise<AxiosResponse<T>> =>
    api.get(`/withdrawals/${id}`),
  cancel: <T>(id: string): Promise<AxiosResponse<T>> =>
    api.post(`/withdrawals/${id}/cancel`),
};

// -------------------------------
// ✅ EXPORT DEFAULT
// -------------------------------
export default api;
