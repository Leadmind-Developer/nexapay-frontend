import api from "./api";

export const RefundAPI = {
  list: () => api.get("/refunds"),

  candidates: () =>
    api.get("/refunds/candidates"),

  create: (transactionId: string) =>
    api.post("/refunds", {
      transactionId,
    }),

  approve: (id: string) =>
    api.post(`/refunds/${id}/approve`),

  reject: (id: string, reason?: string) =>
    api.post(`/refunds/${id}/reject`, {
      reason,
    }),
};
