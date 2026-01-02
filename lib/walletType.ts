export type WalletTxType = "credit" | "debit";

export type WalletTxStatus = "success" | "pending" | "failed";

export interface WalletTransaction {
  id: number;
  type: WalletTxType;
  amount: number;
  status: WalletTxStatus;
  reference?: string;
  createdAt: string;
  metadata?: {
    externalBank?: {
      bankName: string;
      accountNumber: string;
    };
  };
}
