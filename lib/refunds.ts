// lib/refunds.ts

import api from "./api";

export const RefundAPI = {
  list: () => api.get("/refunds"),

  create: (payload: {
    userId: number;
    amount: number;
    sourceType: string;
    sourceId: string;
    reason?: string;
  }) =>
    api.post("/refunds", payload),

  approve: (id: string) =>
    api.post(`/refunds/${id}/approve`),

  reject: (id: string, reason?: string) =>
    api.post(`/refunds/${id}/reject`, {
      reason,
    }),
};
