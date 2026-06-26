// components/admin/refunds/types.ts

export interface Refund {
  id: string;

  userId: number;

  /**
   * Stored in KOBO
   * Display with: amount / 100
   */
  amount: number;

  sourceType: string;
  sourceId: string;

  /**
   * Original transaction reference
   */
  reference: string;

  /**
   * Refund reason
   */
  reason?: string;

  /**
   * Admin processing status
   */
  status:
    | "PENDING"
    | "COMPLETED"
    | "REJECTED";

  /**
   * Audit timestamps
   */
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;

  /**
   * Admin audit
   */
  approvedBy?: number;

  approver?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  /**
   * User receiving refund
   */
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  /**
   * Original VTpass transaction details
   * (optional until backend exposes them)
   */
  transaction?: {
    id: string;

    requestId?: string;

    serviceID?: string;

    serviceName?: string;

    phone?: string;

    meterNumber?: string;

    customerId?: string;

    status?: string;

    amount?: number;

    createdAt?: string;
  };
}
