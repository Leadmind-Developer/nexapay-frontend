// lib/manualcredit.ts

import api from "./api";

export const ManualCreditAPI = {
  /**
   * Search user by email or username
   */
  lookup: (identifier: string) =>
    api.get("/wallet/admin/lookup", {
      params: {
        identifier,
      },
    }),

  /**
   * Manual wallet credit
   */
  credit: (payload: {
    identifier: string;
    amount: number;
    narration?: string;
  }) =>
    api.post("/wallet/admin/manual-credit", payload),
};
