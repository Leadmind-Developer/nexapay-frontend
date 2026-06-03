// components/admin/refunds/types.ts

export interface Refund {
  id: string;
  userId: number;

  amount: number;

  sourceType: string;
  sourceId: string;

  reason?: string;

  status: "PENDING" | "COMPLETED" | "REJECTED";

  reference: string;

  createdAt: string;

  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}
