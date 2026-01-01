import { TransactionItem } from "./transaction.types";

export function isValidTransaction(tx: any): tx is TransactionItem {
  return (
    tx &&
    typeof tx === "object" &&
    typeof tx.requestId === "string" &&
    typeof tx.createdAt === "string"
  );
}
